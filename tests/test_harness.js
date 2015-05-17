/**
@describe Any implementation may call this function to register itself for tests
*/
(function() {
  var factories = [];
  window.registerFactory = function (name, implementationFactory) {
    factories.push({
      name: name,
      factory: implementationFactory
    });
  };

  window.getFactories = function() {
    return factories;
  };
})();

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
