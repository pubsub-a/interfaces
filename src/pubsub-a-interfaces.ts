export interface PubSub {

    /**
     * true when the .stop() call has executed (resolved)
     */
    readonly isStopped: boolean;

    /**
     * true when the pubsub instance has started
     */
    readonly isStarted: boolean;

    /**
     * Hook to be notified if the instance started
     */
    readonly onStart: Promise<void>;

    /**
     * Hook to be notified if the instance stoped (this might me regular stop or due to an error).
     */
    readonly onStop: Promise<StopStatus>;

    /**
     * A unique identifier that identifies a client
     */
    clientId: string;

    start(): Promise<PubSub>;
    stop(status: StopStatus): Promise<void>;

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
    | "DISCONNECT_REASON"

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

    /**
     * payload: A string with detailed information
     * Publishing on that topic tells a client more details about why a connection is to be terminated. After
     * publishing on that topic, server MUST disconnect the client. Clients needs not to disconnect are react
     * to this event in any way. Logging the reason somehow is recommended, however.
     */
    T extends "DISCONNECT_REASON" ? string :

    /** Implementations might chose other topic/payload fields. For above topics we enforce the type, though. */
    never;


// A note on enums (numeric or strings): eunms actually result in emitted javascript code
// using a string union type will not emit any .js code, but only show up in a .d.ts file!

/**
 * When a PubSub instance stops, reasons should be given to allow error handling/retry logic etc.
 */
export type StopReason =
    | "REMOTE_DISCONNECT"
    | "CONNECT_FAILURE"
    | "LOCAL_DISCONNECT"
    | "UNSPECIFIED_ERROR"

export interface StopStatus {
    reason: StopReason;
    additionalInfo?: string;
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
