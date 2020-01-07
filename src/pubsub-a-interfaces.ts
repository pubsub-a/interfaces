export interface PubSub {
    /**
     * true when the .stop() call has executed (resolved)
     */
    readonly isStopped: boolean;

    /**
     * true when the pubsub instance has started, immediately after .start() has been called. Whether or not a connection
     * to a backend system is successful, is not relevant.
     */
    readonly isStarted: boolean;

    /**
     * Hook to be notified if the instance stoped (this might me regular stop or due to an error).
     * Resolves when the instance was stopped successfully.
     * Rejects when there was an error while stopping the instance.
     */
    readonly onStop: Promise<StopStatus>;

    // TODO: can this be readonly? Is this a random value or dependent on the socket?!?
    /**
     * A unique identifier that identifies a client.
     */
    clientId: string;

    /**
     * Starts the PubSub instance.
     * Resolves with the PubSub instance if starting (i.e. connecting to a remote server) was successfull.
     * Rejects
     */
    start(): Promise<PubSub>;

    /**
     * Stops an instance (i.e. might perform disconnects from remote servers). Immedediately after stopping the instance,
     * the isStopped must be set to true. After a stop, all subscriptions MUST be * removed and any subsequent
     * publishes arriving after a stop must fail (i.e. return a rejected promise)
     *
     * @param status A StopStatus with details about the stopping reason. If status is not given, it MUST be
     *               set to { reason: "LOCAL_DISCONNECT", code: 0 }
     */
    stop(status?: StopStatus): Promise<void>;

    channel<TName extends string>(name: TName): Promise<ChannelType<TName>>;
}

export type ChannelType<TName extends string> = TName extends "__internal" ? InternalChannel : Channel;

/**
 * A communication channel used for topic grouping.
 */
export interface Channel<TMap extends {} = any> {
    readonly name: string;

    /**
     * A reference to the pubsub instance that channel belongs to
     */
    readonly pubsub: PubSub;

    publish<K extends keyof TMap>(topic: K, payload: TMap[K]): Promise<void>;

    /**
     * Subscribe an observer to a topic.
     *
     * @param callback - If given, the callback will be executed after the server has
     *   confirmed that the subscription was sucessfully put in place
     */
    subscribe<K extends keyof TMap>(topic: K, observer: ObserverFunc<TMap[K]>): Promise<SubscriptionToken>;

    /**
     * Will subscribe an observer and immediately unsubscribe the observer after a single publication was
     * done.
     */
    once<K extends keyof TMap>(topic: K, observer: ObserverFunc<TMap[K]>): Promise<SubscriptionToken>;
}

export interface ClientDisconnectMessage {
    clientId: string;
    reason: "DISCONNECT" | "NOT_CONNECTED";
}

/**
 * The topic & types used for the special InternalChannel
 */
export interface InternalMessageMap {
    CLIENT_DISCONNECT: ClientDisconnectMessage;
    SUBSCRIBE_DISCONNECT: string;
    UNSUBSCRIBE_DISCONNECT: string;
}

// Pretty much same as a regular channel but with fixed name, payload/topic pairs for reserved topics
export interface InternalChannel extends Channel<InternalMessageMap> {
    readonly name: "__internal";
}

export interface DisposeNotification {
    (subscriptionCount: number | undefined): any;
}

/**
 * Class that represents a subscription and can be used to remove the subscription and perform
 * cleanup.
 */
export interface SubscriptionToken {
    /**
     * Will remove the subscription.
     * @returns     A promise that resolves with the subscription count, that is left for that topic.
     *              If the subscription count is not supported by the backend, it should return undefined.
     */
    dispose(): Promise<number | undefined>;

    /**
     *Indicates whether this subscription was already disposed by calling .dispose().
     * Any subsequent calls to dispose() will have no effect.
     */
    isDisposed: boolean;

    /**
     * Number of LOCAL subscriptions at the time of subscribing - minimum will be 1
     * as the own subscription is counted in. If the backend does not support counting
     * subscriptions, this should be undefined.
     */
    count: number | undefined;

    /**
     * Add a notification function that will be called when the dispose is successfull
     * @param disposeNotification A notification callback
     */
    add(disposeNotification: DisposeNotification): void;

    /**
     * Remove a notification function previously added via .add(). If the function is not or was not added, this is
     * silently ignored (= no exception is thrown).
     * @param disposeNotification The notification callback added via add()
     */
    remove(disposeNotification: DisposeNotification): void;
}

/**
 * @description Argument that is passed to any .subscribe() function and
 * executed upon publishes
 */
export type ObserverFunc<T> = (payload: T) => any;

// A note on enums (numeric or strings): eunms actually result in emitted javascript code
// using a string union type will not emit any .js code, but only show up in a .d.ts file!

/**
 * When a PubSub instance stops, reasons should be given to allow error handling/retry logic etc.
 */
export type StopReason =
    /**
     * When the remote ends terminates the connection
     */
    | "REMOTE_DISCONNECT"

    /**
     * When a connection could never be made after .start()'ing a PubSub instance (i.e. closed port, timeout etc.)
     */
    | "CONNECT_FAILURE"

    /**
     * When local end disconnects, i.e. by calling .stop()
     */
    | "LOCAL_DISCONNECT"

    /**
     * When a timeout occured, i.e. the remote did not respond to pings or the connection was interrupted due to timeout
     */
    | "TIMEOUT"

    /**
     * Other Error occured. SHOULD set a code or additionalInfo field.
     */
    | "UNSPECIFIED_ERROR";

export interface StopStatus {
    reason: StopReason;

    /**
     * Optional codes to set upon error. Codes MUST follow these ranges:
     * 000      To be used when the client disconnects voluntarily by calling .stop() with LOCAL_DISCONNECT
     * 001-099  Freely usable, but provides no semantic information about the error. Not recommended.
     * 100-199  Immediate reconnect after disconnect is encouraged (i.e. server configuration reload, update)
     * 200-299  Reconnect is encouraged after a reasonable grace period of a few minutes
     * 300-399  Reconnect is discouraged, but encourage to try other servers in cluster/redirect info
     * 400-499  Error occured, no information about reconnect encouragement
     * 500-599  Error occured, disconnect encourages to NOT reconnect to this server (i.e. high load situation, permanent server shutdown)
     * 600-999  Reserved, do not use.
     */
    code?: number;
    additionalInfo?: string;
}

export interface StopError extends Error {
    status: StopStatus;
}

/**
 * Only used for spec validation / testing. Any implementation must expose this factory for the unit
 * tests to test the implementation
 */
export interface ImplementationFactory {
    /**
     * A string identifier to the implementation name.
     */
    name: string;

    /**
     * Returns a single instance
     */
    getPubSubImplementation: () => PubSub;

    /**
     * Returns a number of PubSub instances that are linked, i.e. where each publish will trigger
     * the corresponding subscription on all other instances.
     */
    getLinkedPubSubImplementation: (numInstances: number) => PubSub[];
}
