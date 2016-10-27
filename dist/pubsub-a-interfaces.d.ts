export interface IPubSub {
    /**
     * true when the .stop() call has executed (resolved)
     */
    readonly isStopped: boolean;
    /**
     * A unique identifier that identifies a client
     */
    clientId: string;
    start(callback?: IPubSubStartCallback, disconnect?: Function): Promise<IPubSub>;
    stop(callback?: IPubSubStopCallback): Promise<void>;
    channel(name: string, callback?: IChannelReadyCallback): Promise<IChannel>;
}
/**
 * Callback that fires when the main PubSub class is ready
 */
export interface IPubSubStartCallback {
    (instance: IPubSub, error: any): void;
}
export interface IPubSubStopCallback {
    (instance: IPubSub, error: any): void;
}
export interface IChannelReadyCallback {
    (channel: IChannel): void;
}
/**
 * A communication channel used for topic grouping.
 */
export interface IChannel {
    name: string;
    publish<T>(topic: string, payload: T, callback?: IPublishReceivedCallback): Promise<void>;
    /**
    * Subscribe an observer to a topic.
    *
    * @param callback - If given, the callback will be executed after the server has
    *   confirmed that the subscription was sucessfully put in place
    */
    subscribe<T>(topic: string, observer: IObserverFunc<T>, callback?: ISubscriptionRegisteredCallback<T>): Promise<ISubscriptionToken>;
    /**
     * Will subscribe an observer and immediately unsubscribe the observer after a single publication was
     * done.
    */
    once<T>(topic: string, observer: IObserverFunc<T>, callback?: ISubscriptionRegisteredCallback<T>): Promise<ISubscriptionToken>;
}
/**
 * Class that represents a subscription and can be used to remove the subscription and perform
 * cleanup.
 */
export interface ISubscriptionToken {
    dispose(callback?: ISubscriptionDisposedCallback): Promise<number>;
    /**
     *Indicates whether this subscription was already dispose by calling .dispose().
     * Any subsequent calls to dispose() are an error and will result in an exception.
     */
    isDisposed: boolean;
    /**
     * Number of LOCAL subscriptions at the time of subscribing - minimum will be 1
     * as the own subscription is counted in
     */
    count: number;
}
export interface ISubscriptionDisposedCallback {
    (number: number | undefined): void;
}
/**
@description Argument that is passed to any .subscribe() function and
executed upon publishes
*/
export interface IObserverFunc<T> {
    (payload: T): any;
}
/**
 * Callback that fires after a subscription was received by the
 * main subscription instance. In networking environments, the callback will
 * fire after the server has successfully registered the subscription.
 */
export interface ISubscriptionRegisteredCallback<T> {
    (subscription: ISubscriptionToken, topic: string, error?: Error): any;
}
export interface IPublishReceivedCallback {
    (error: Error | undefined, status?: any): void;
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
export declare class InternalChannelTopic {
    static CLIENT_DISCONNECT: string;
    static SUBSCRIBE_DISCONNECT: string;
    static UNSUBSCRIBE_DISCONNECT: string;
}
