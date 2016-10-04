if (typeof window === "undefined") {
    let c = require('chai');
    var expect = c.expect;
    var randomValidChannelOrTopicName = require('../test_helper').randomValidChannelOrTopicName;
}

const executeStartStopTests = (factory) => {

    describe(`['${factory.name}] should pass the start/stop implementation test`, () => {

        let pubsub;

        beforeEach(done => {
            pubsub = factory.getPubSubImplementation();
            done();
        });

        it("should pass the same pubsub instance as returned in the promise in the callback function", done => {
            let cb_pubsub;
            let promise = pubsub.start((instance, error) => {
                cb_pubsub = instance;
            });

            promise.then(pubsub => {
                expect(pubsub).to.equal(cb_pubsub);
                done();
            });
        });

        it("set an undefined error object if no error occurs", done => {
            let promise = pubsub.start((instance, error) => {
                expect(error).to.be.undefined;
                done();
            });
        });

        it("should throw an error if calling start() again after the stop() function", done => {
            pubsub.start().then(() => {
                pubsub.stop();
                expect(() => pubsub.start()).to.throw();
                done();
            });
        });

        it("should be allowed to call stop multiple times", done => {
            pubsub.start().then(() => {
                expect(() => {
                    pubsub.stop();
                    pubsub.stop();
                    pubsub.stop();
                }).not.to.throw();
                done();
            });
        });

        it("should trigger the stop callback after the pubsub was stopped", done => {
            pubsub.start().then(() => {
                pubsub.stop(() => {
                    expect(true).to.be.ok;
                    done();
                })
            })
        })

        it("should resolve the promise after the pubsub was stopped", done => {
            pubsub.start().then(() => {
                pubsub.stop().then(() => {
                    expect(true).to.be.ok;
                    done();
                })
            })
        })

        it("should not be possible to publish/subscribe after the .stop function has been called", done => {
            const topic = randomValidChannelOrTopicName();

            pubsub.start().then(() => {
                pubsub.channel(topic).then(channel => {
                    pubsub.stop();

                    expect(() => {
                        channel.publish(topic, "foo");
                    }).to.throw();

                    expect(() => {
                        channel.subscribe(topic, () => void 0);
                    }).to.throw();

                    done();
                });
            });
        });

        it("should not be possible to create a channel if the .stop function has been called", done => {
            const topic = randomValidChannelOrTopicName();

            pubsub.start().then(() => {
                pubsub.stop().then(() => {
                    expect(() => {
                        pubsub.channel(topic, () => void 0);
                    }).to.throw();
                });
                done();
            })
        });
    });
}

if (typeof window === "undefined") {
    module.exports = {
        executeStartStopTests: executeStartStopTests
    };
}
