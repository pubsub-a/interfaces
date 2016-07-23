import {Promise} from "es6-promise";

export interface IPubSub {
  start(callback?: IPubSubStartCallback, disconnect?: Function): Promise<IPubSub>;
  stop(callback?: IPubSubStopCallback): Promise<void>;

  channel(name: string, callback?: IChannelReadyCallback): Promise<IChannel>;

  /*
  It is not possible to declare an interface member method as static in TypeScript - so bare in
  mind that any implementation must have this .includeIn() method here as static method
  includeIn: IPubSubOperationsMixin;
  */
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
  (status: any, error: any);
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
  subscribe<T>(topic: string, subscription: ISubscriptionFunc<T>,
    callback?: ISubscriptionRegisteredCallback<T>): ISubscriptionToken;

  // subscribe and dispose subscription after removal
  once<T>(topic: string, subscription: ISubscriptionFunc<T>,
    callback?: ISubscriptionRegisteredCallback<T>): ISubscriptionToken;

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

  /* will remove the subscription */
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
  (SubscriptionDisposedCallback): number;
}

export interface SubscriptionDisposedCallback {
  /* callback once the subscription is disposed. Passes the number of remaining subscriptions.
    If a backend doesnt support that, the first argument should be undefined.
   */
  (number?): void;
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
  (dispose: ISubscriptionToken, topic: string, subscription: ISubscriptionFunc<T>);
}

export interface IPublishReceivedCallback<T> {
  (): any;
}

