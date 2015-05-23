module PubSubA {

  export interface IPubSub {
    start (callback?: IPubSubStartCallback, disconnect?: Function);
    stop (callback?: IPubSubStopCallback);

    channel (name: string): IChannel;
  }

  /**
  @description Callback that fires when the main PubSub class is ready
  */ 
  export interface IPubSubStartCallback {
    (context: IPubSub, error: any, status: any): void;
  }

  export interface IPubSubStopCallback {
    (context: IPubSub, status: any);
  }

  /**
  @description A communication channel.
  */
  export interface IChannel {

    name: string;

    publish<T> (topic: string, payload: T, callback?: IPublishReceivedCallback<T>): void;

    // alias function, must point to publish
    trigger<T> (topic: string, payload: T, callback?: IPublishReceivedCallback<T>): void;

    /**
    @description Subscribe to a topic.
    @param callback - If given, the callback will be executed after the server has
      confirmed that the subscription was sucessfully put in place
    */
    subscribe<T> (topic: string, subscription: ISubscriptionFunc<T>,
      callback?: ISubscriptionRegisteredCallback<T>) : ISubscriptionToken;

    // alias function, must point to subscribe
    on<T> (topic: string, subscription: ISubscriptionFunc<T>,
      callback?: ISubscriptionRegisteredCallback<T>) : ISubscriptionToken;

    // subscribe and dispose subscription after removal
    once<T> (topic: string, subscription: ISubscriptionFunc<T>,
      callback?: ISubscriptionRegisteredCallback<T>) : ISubscriptionToken;
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

}
