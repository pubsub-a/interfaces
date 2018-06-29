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
     */
    readonly onStop: Promise<StopStatus>;

    // TODO: can this be readonly? Is this a random value or dependent on the socket?!?
    /**
     * A unique identifier that identifies a client.
     */
    clientId: string;

    start(): Promise<PubSub>;
    stop(status?: StopStatus): Promise<void>;

    channel<TName extends string>(name: TName): Promise<ChannelType<TName>>;
}

export type ChannelType<TName extends string> = TName extends "__internal" ? InternalChannel : Channel;

/**
 * A communication channel used for topic grouping.
 */
export interface Channel {
    readonly name: string;

    /**
     * A reference to the pubsub instance that channel belongs to
     */
    readonly pubsub: PubSub;

    publish<T>(topic: string, payload: T): Promise<any>;

    /**
    * Subscribe an observer to a topic.
    *
    * @param callback - If given, the callback will be executed after the server has
    *   confirmed that the subscription was sucessfully put in place
    */
    subscribe<T = any>(topic: string, observer: ObserverFunc<T>): Promise<SubscriptionToken>;

    /**
     * Will subscribe an observer and immediately unsubscribe the observer after a single publication was
     * done.
     */
    once<T = any>(topic: string, observer: ObserverFunc<T>): Promise<SubscriptionToken>;
}

// Pretty much same as a regular channel but with fixed name, payload/topic pairs for reserved topics
export interface InternalChannel {
    readonly name: "__internal";

    // TODO: eliminate Message wrapper with callback; use the returned Promise as an ack?
    publish<TTopic extends InternalChannelTopic>(topic: TTopic, payload: InternalMessageType<TTopic>): Promise<any>;

    subscribe<TTopic extends InternalChannelTopic>(topic: TTopic, observer: ObserverFunc<InternalMessageType<TTopic>>)
        : Promise<SubscriptionToken>;

    once<TTopic extends InternalChannelTopic>(topic: TTopic, observer: ObserverFunc<InternalMessageType<TTopic>>)
        : Promise<SubscriptionToken>;
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
     * Any subsequent calls to dispose() are an error and will result in an exception.
     */
    isDisposed: boolean;

    /**
     * Number of LOCAL subscriptions at the time of subscribing - minimum will be 1
     * as the own subscription is counted in. If the backend does not support counting
     * subscriptions, this should be undefined.
     */
    count: number | undefined;
}

/**
 * @description Argument that is passed to any .subscribe() function and
 * executed upon publishes
 */
export interface ObserverFunc<T> {
    (payload: T): any;
}

/**
 * List of currently allowed topics for the __internal channel. These are reserved topics to carry transport or
 * meta information such as the link, server/connection state etc. See below for documentation on each topic.
 */
export type InternalChannelTopic =
    | "CLIENT_DISCONNECT"
    | "SUBSCRIBE_DISCONNECT"
    | "UNSUBSCRIBE_DISCONNECT"

/**
 * Maps the type of the payload of the message based on the string topic of the message
 * (which inherently determines its payload type)
 */
export type InternalMessageType<T extends InternalChannelTopic> =
    /**
     * payload: A clientId.
     * Publishing to this topic will let the subscribers know that a client by that id got
     * disconnected.
     */
    T extends "CLIENT_DISCONNECT" ? string :

    /**
     * payload: A clientId.
     * Publishing on this topic tells the server that we wan't to be informed
     * if a client disconnects.
     */
    T extends "SUBSCRIBE_DISCONNECT" ? string :

    /**
     * payload: A clientId.
     * Publishing on this topic tells the server that we are no longer interested if  client
     * by this id disconnects and we do not want to receive any more "CLIENT_DISCONNECT" events
     * for that client.
     */
    T extends "UNSUBSCRIBE_DISCONNECT" ? string :

    /** Implementations might chose other topic/payload fields. For above topics we enforce the type, though. */
    never;


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
    | "UNSPECIFIED_ERROR"

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
     * the corresponding subscribe on all other instances.
     */
    getLinkedPubSubImplementation: (numInstances: number) => PubSub[];
}
