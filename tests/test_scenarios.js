function scenarioTwoEndpoints(pubsubImplementationFactory) {

  var firstReady = new Rx.AsyncSubject();
  var secondReady = new Rx.AsyncSubject();
  var scenarioData = {};

  // the shared channel secret is known and identical at both sides
  var random = scenarioData.sharedChannelId = randomString();

  scenarioData.pubsub1 = pubsubImplementationFactory(true);
  var firstReady = new Promise(function(resolve, reject) {
    scenarioData.pubsub1.start(function() {
      scenarioData.pubsub1.channel(random, function(chan) {
        scenarioData.channel1 = chan;
        resolve();
      });
    });
  });

  scenarioData.pubsub2 = pubsubImplementationFactory(false);

  var secondReady = new Promise(function(resolve, reject) {
    scenarioData.pubsub2.start(function() {
      scenarioData.pubsub2.channel(random, function(chan) {
        scenarioData.channel2 = chan;
        resolve();
      });
    });
  });

  var allReady = Promise.when(firstReady, secondReady);
  return allReady;
}

module.exports = {
  scenarioTwoEndpoints: scenarioTwoEndpoints
};