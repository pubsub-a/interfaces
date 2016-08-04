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
        // factories is a global variable in test_harness.js
        facs = factories;
    }

    facs.forEach(function(factory) {

        var executeCommonBasicPubSubTests;
        var executeChannelTests;
        var executeStringValidationTests;
        var executeLinkedPubSubTests;
        var executeDisposeAndCleanupTests;

        if (typeof window === "undefined") {
            executeCommonBasicPubSubTests = require("./spec/test_common_basic_pubsub").executeCommonBasicPubSubTests;
            executeChannelTests = require("./spec/test_channels").executeChannelTests;
            executeStringValidationTests = require("./spec/test_string_validation").executeStringValidationTests;
            executeLinkedPubSubTests = require("./spec/test_linked_pubsub").executeLinkedPubSubTests;
            executeDisposeAndCleanupTests = require("./spec/test_dispose_and_cleanup").executeDisposeAndCleanupTests;
        } else {
            executeCommonBasicPubSubTests = window.executeCommonBasicPubSubTests;
            executeChannelTests = window.executeChannelTests;
            executeStringValidationTests = window.executeStringValidationTests;
            executeLinkedPubSubTests = window.executeLinkedPubSubTests;
            executeDisposeAndCleanupTests = window.executeDisposeAndCleanupTests;
        }

        executeCommonBasicPubSubTests(factory);
        executeChannelTests(factory);
        executeStringValidationTests(factory);
        executeLinkedPubSubTests(factory);
        executeDisposeAndCleanupTests(factory);
    });
}

runTests();
