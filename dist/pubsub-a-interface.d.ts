import { Promise } from "es6-promise";
export interface IPubSub {
    start(callback?: IPubSubStartCallback, disconnect?: Function): Promise<IPubSub>;
    stop(callback?: IPubSubStopCallback): Promise<void>;
    channel(name: string, callback?: IChannelReadyCallback): Promise<IChannel>;
}
/**
 *includeIn function that has to be present on the implementation that implements
 * IPubSub.
 */
export interface IPubSubOperationsMixin {
    (obj: any, publish_name?: string, subscribe_name?: string): any;
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
export interface IPubSubOperations {
    publish<T>(topic: string, payload: T, callback?: IPublishReceivedCallback<T>): void;
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
 * A communication channel used for topic grouping.
 */
export interface IChannel extends IPubSubOperations {
    name: string;
}
/**
 * Class that represents a subscription and can be used to remove the subscription and perform
 * cleanup.
 */
export interface ISubscriptionToken {
    dispose: (callback?: SubscriptionDisposedCallback) => number;
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
export interface disposeFunction {
    (SubscriptionDisposedCallback: any): number;
}
export interface SubscriptionDisposedCallback {
    (number?: any): any;
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
    (subscription: ISubscriptionToken, topic: string): any;
}
export interface IPublishReceivedCallback<T> {
    (): any;
}
