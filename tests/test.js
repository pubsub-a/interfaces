/**
@describe Will execute all tests that apply to all PubSub implementations
@param getPubSubImplementation -  A factory function that should return a fresh (untouched) pubsub
  instance of type PubSub. This factory is called in the beforeEach() method before each test is run.
*/

var basicTests = require("./spec/test_common_basic_pubsub");

var factory = require("../../pubsub-micro/tests/spec-validation.js");
basicTests.executeCommonBasicPubSubTests(factory.factory);
