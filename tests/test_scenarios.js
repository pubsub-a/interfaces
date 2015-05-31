function scenarioTwoEndpoints(getPubSubImplementation) {

  var firstReady = new Rx.AsyncSubject();
  var secondReady = new Rx.AsyncSubject();
  var scenarioData = {};

  // the shared channel secret is known and identical at both sides
  var random = scenarioData.sharedChannelId = randomString();

  scenarioData.pubsub1 = getPubSubImplementation(true);
  scenarioData.pubsub1.start(function() {
    scenarioData.pubsub1.channel(random, function(chan) {
      scenarioData.channel1 = chan;
      scenarioData.remoteFactory1 = new PubSubA.RxExtra.RemoteObservableFactory(scenarioData.channel1);
      firstReady.onCompleted();
    });
  });

  scenarioData.pubsub2 = getPubSubImplementation(false);
  scenarioData.pubsub2.start(function() {
    scenarioData.pubsub2.channel(random, function(chan) {
      scenarioData.channel2 = chan;
      scenarioData.remoteFactory2 = new PubSubA.RxExtra.RemoteObservableFactory(scenarioData.channel2);
      secondReady.onCompleted();
    });
  });

  var result = new Rx.AsyncSubject();
  Rx.Observable.concat(firstReady, secondReady).subscribeOnCompleted(function() {
    result.onNext(scenarioData);
    result.onCompleted();
  });
  return result.asObservable();
}