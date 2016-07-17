/**
@describe Will execute all tests that apply to all PubSub implementations
@param getPubSubImplementation -  A factory function that should return a fresh (untouched) pubsub
  instance of type PubSub. This factory is called in the beforeEach() method before each test is run.
*/


if (typeof window === "undefined") {
    var registerPubSubImplementationFactory = require("./test_harness").registerPubSubImplementationFactory;

    try {
        // pubsub-micro
        var factory = require("../../pubsub-a-micro/tests/spec-validation.js");
        registerPubSubImplementationFactory(factory);
    } catch(err) {
        console.log('Could not load pubsub-micro tests: ' + err);
    }

    try {
        // pubsub-server-a-node
        var factory = require("../../pubsub-a-server-node/tests/spec-validation.js");
        registerPubSubImplementationFactory(factory);
    } catch(err) {
        console.log('Could not load pubsub-server-node tests: ' + err);
    }

} else {
    // instead of require() the test cases, add them in the karma.conf.js file and expose as global variable
}

function runTests() {
    var facs;

    if (typeof window === "undefined") {
        facs = require("./test_harness").factories;
    } else {
        // global variable in test_harness.js
        facs = factories;
    }

    facs.forEach(function(factory) {

        // displays a log message whenever the implementation factory is retrieved - usefull for debugging
        var getImpl = function() {
            console.info("Implementation: " + factory.name);
            return new factory.factory();
        };

        var executeCommonBasicPubSubTests;
        var executeChannelTests;

        if (typeof window === "undefined") {
            executeCommonBasicPubSubTests = require("./spec/test_common_basic_pubsub").executeCommonBasicPubSubTests;
            executeChannelTests = require("./spec/test_channels").executeChannelTests;
        } else {
            executeCommonBasicPubSubTests = window.executeCommonBasicPubSubTests;
            executeChannelTests = window.executeChannelTests;
        }

        executeCommonBasicPubSubTests(getImpl);
        executeChannelTests(getImpl);
    });
}

runTests();
