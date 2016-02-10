/**
@describe Will execute all tests that apply to all PubSub implementations
@param getPubSubImplementation -  A factory function that should return a fresh (untouched) pubsub
  instance of type PubSub. This factory is called in the beforeEach() method before each test is run.
*/

var basicTests = require("./spec/test_common_basic_pubsub");

try {
    // pubsub-micro
    var factory = require("../../pubsub-micro/tests/spec-validation.js");
    basicTests.executeCommonBasicPubSubTests(factory.factory);
} catch(err) {
    console.log('Could not load pubsub-micro tests: ' + err);
}

try {
    // pubsub-micro
    var factory = require("../../pubsub-server-node/tests/spec-validation.js");
    basicTests.executeCommonBasicPubSubTests(factory.factory);
} catch(err) {
    console.log('Could not load pubsub-server-node tests: ' + err);
}

