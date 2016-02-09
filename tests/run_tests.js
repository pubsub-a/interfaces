/**
@describe Will execute all tests that apply to all PubSub implementations
@param getPubSubImplementation -  A factory function that should return a fresh (untouched) pubsub
  instance of type PubSub. This factory is called in the beforeEach() method before each test is run.
*/
(function() {

  var factories = window.getFactories();

  factories.forEach(function(factory) {

    describe(factory.name, function() {
      executeCommonBasicPubSubTests(factory.factory);
    });

  });

})();