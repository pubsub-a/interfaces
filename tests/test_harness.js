/**
@describe Will execute all tests that apply to all PubSub implementations
@param getPubSubImplementation -  A factory function that should return a fresh (untouched) pubsub
  instance of type PubSub. This factory is called in the beforeEach() method before each test is run.
*/
function callAllTests(getPubSubImplementation) {
  executeCommonBasicPubSubTests(getPubSubImplementation);
}

/**
Tests are loaded and executed for external implementations. To load an external implementation that
conforms to the PubSub/A spec, modify the karma.conf.js file to include the testloader and implementation
for it. See PubSub.Micro as an example.
*/
describe('Empty test', function() {
  it('is a placeholder so that Karma/Jasmine does not report an error when no tests are loaded', function() {
    expect(true).toBeTruthy();
  });
});

/*
describe('PubSub.SocketIO.Client', function() {
  var getPubSubImplementation = function() {
    var pubsub = new PubSub.Network.SocketIO.Client ("pubsub+socketio://localhost:9800");
    return pubsub;
  };
  callAllTests(getPubSubImplementation);
});
*/