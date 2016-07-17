var factories = [];

function registerPubSubImplementationFactory(factory) {
    factories.push(factory);
}

if (typeof window === "undefined") {
    module.exports = {
        factories: factories,
        registerPubSubImplementationFactory: registerPubSubImplementationFactory
    };
}