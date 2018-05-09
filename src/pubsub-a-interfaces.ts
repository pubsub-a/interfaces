export interface IPubSub {

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

    start(): Promise<IPubSub>;
    stop(status: StopStatus): Promise<void>;

    channel(name: string): Promise<IChannel>;
}

/**
 * A communication channel used for topic grouping.
 */
export interface IChannel {
    name: string;

    pubsub: IPubSub;

    publish<T>(topic: string, payload: T): Promise<any>;

    /**
    * Subscribe an observer to a topic.
    *
    * @param callback - If given, the callback will be executed after the server has
    *   confirmed that the subscription was sucessfully put in place
    */
    subscribe<T = any>(topic: string, observer: IObserverFunc<T>): Promise<ISubscriptionToken>;

    /**
     * Will subscribe an observer and immediately unsubscribe the observer after a single publication was
     * done.
    */
    once<T = any>(topic: string, observer: IObserverFunc<T>): Promise<ISubscriptionToken>;
}

/**
 * Class that represents a subscription and can be used to remove the subscription and perform
 * cleanup.
 */
export interface ISubscriptionToken {

    /**
     * Will remove the subscription.
     * @returns     A promise that resolves with the subscription count, that is left for that topic.
     *              If the subscription count is not supported by the backend, it should return undefined.
     */
    dispose(): Promise<number | undefined>;

    /**
     *Indicates whether this subscription was already dispose by calling .dispose().
     * Any subsequent calls to dispose() are an error and will result in an exception.
     */
    isDisposed: boolean;

    /**
     * Number of LOCAL subscriptions at the time of subscribing - minimum will be 1
     * as the own subscription is counted in. If the backend does not support counting
     * subscriptions, this should still be undefined.
     */
    count: number | undefined;
}

/**
 * @description Argument that is passed to any .subscribe() function and
 * executed upon publishes
 */
export interface IObserverFunc<T> {
    (payload: T): any;
}

/**
 * Documentation: INTERNAL CHANNEL
 * The reserved channel name '__internal' is reserved for special communication. Currently the
 * following topics exist that have special role:
 *
 *    - "subscribe_disconnect" - Param: A clientId
 *    - "unsubscribe_disconnect" - Param: A clientId
 *
 *      The above two can be used to be notified whenever a client disconnect from the server.
 *      You have to know that client's clientId upfront and pass it as payload parameter. Upon
 *      disconnection, another topic on the __internal channel is published to:
 *
 *    - "client_disconnect" - Param: The client's clientId that disconnected
 *
 *   IMPORTANT NOTE: For all PUBLISHES on the __internal channel the following message format
 *                   interface must be used
 *
 */
export interface InternalChannelMessage {
    /**
     * The actual parameter to pass (i.e. clientId for "subscribe_disconnect")
     */
    payload: any;

    /**
     * Any form of callback that signals that the operation required to process the internal
     * message is complete (i.e. a subscription received at the server)
     */
    callback?: Function;
}

/**
 * List of currently allowed topics for the __internal channel.
 */
export class InternalChannelTopic {
    static CLIENT_DISCONNECT = "client_disconnect";
    static SUBSCRIBE_DISCONNECT = "subscribe_disconnect";
    static UNSUBSCRIBE_DISCONNECT = "unsubscribe_disconnect";
}

/**
 * When a PubSub instance stops, reasons should be given to allow error handling/retry logic etc.
 */
export type StopReason = "REMOTE_DISCONNECT" | "LOCAL_DISCONNECT" | "UNSPECIFIED_ERROR";

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
    getPubSubImplementation: () => IPubSub;

    /**
     * Returns a number of IPubSub instances that are linked, i.e. where each publish will trigger
     * the corresponding subscribe on all other instances.
     */
    getLinkedPubSubImplementation: (numInstances: number) => IPubSub[];
}
