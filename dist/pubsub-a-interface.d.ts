export interface IPubSub {
    /**
     * true when the .stop() call has executed (resolved)
     */
    readonly isStopped: boolean;
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
