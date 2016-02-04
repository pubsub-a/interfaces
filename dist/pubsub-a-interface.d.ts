export interface IPubSub {
    start(callback?: IPubSubStartCallback, disconnect?: Function): any;
    stop(callback?: IPubSubStopCallback): any;
    channel(name: string, callback?: IChannelReadyCallback): IChannel;
}
/**
@description includeIn function that has to be present on the implementation that implements
  IPubSub.
*/
export interface IPubSubOperationsMixin {
    (obj: any, publish_name?: string, subscribe_name?: string): any;
}
/**
@description Callback that fires when the main PubSub class is ready
*/
export interface IPubSubStartCallback {
    (status: any, error: any): void;
}
export interface IPubSubStopCallback {
    (status: any, error: any): any;
}
export interface IChannelReadyCallback {
    (channel: IChannel): void;
}
export interface IPubSubOperations {
    publish<T>(topic: string, payload: T, callback?: IPublishReceivedCallback<T>): void;
    /**
    @description Subscribe to a topic.
    @param callback - If given, the callback will be executed after the server has
      confirmed that the subscription was sucessfully put in place
    */
    subscribe<T>(topic: string, subscription: ISubscriptionFunc<T>, callback?: ISubscriptionRegisteredCallback<T>): ISubscriptionToken;
    once<T>(topic: string, subscription: ISubscriptionFunc<T>, callback?: ISubscriptionRegisteredCallback<T>): ISubscriptionToken;
}
/**
@description A communication channel used for topic grouping.
*/
export interface IChannel extends IPubSubOperations {
    name: string;
}
/**
@description Class that helps cleaning up subscriptions
*/
export interface ISubscriptionToken {
    dispose: (callback?: SubscriptionDisposedCallback) => number;
    /**
    @description Indicates whether this subscription was already dispose by calling .dispose().
      Any subsequent calls to dispose() are an error and will result in an exception.
    */
    isDisposed: boolean;
    /**
    @description Number of LOCAL subscriptions at the time of subscribing - minimum will be 1
      as the own subscription is counted in
    */
    count: number;
}
export interface disposeFunction {
    (SubscriptionDisposedCallback: any): number;
}
export interface SubscriptionDisposedCallback {
    (number?: any): void;
}
/**
@description Argument that is passed to any .subscribe() function and
executed upon publishes
*/
export interface ISubscriptionFunc<T> {
    (payload: T): void;
}
/**
@description Callback that fires after a subscription was received by the
  main subscription instance. In networking environments, the callback will
  fire after the server has successfully registered the subscription.
*/
export interface ISubscriptionRegisteredCallback<T> {
    (dispose: ISubscriptionToken, topic: string, subscription: ISubscriptionFunc<T>): any;
}
export interface IPublishReceivedCallback<T> {
    (): any;
}
