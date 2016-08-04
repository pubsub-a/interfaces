if (typeof window === "undefined") {
    let c = require('chai');
    var expect = c.expect;
    var randomValidChannelOrTopicName = require('../test_helper').randomValidChannelOrTopicName;
    var Rx = require('rxjs/Rx');
    var Promise = require("es6-promise").Promise;
}

const executeDisposeAndCleanupTests = (factory) => {

    describe('dispose and cleanup methods', function (){
        this.timeout(50000);
        let pubsub;
        let channel;

        beforeEach(done => {
            // increase the timeout
            pubsub = factory.getPubSubImplementation();
            pubsub.start(() => {
                let random = randomValidChannelOrTopicName();
                pubsub.channel(random, (chan) => {
                    channel = chan;
                    done();
                });
            });
        });

        it('should not dispose all identical subscriptions if a single one is disposed', (done) => {
            let channel_name = randomValidChannelOrTopicName();

            pubsub.channel(channel_name, (chan) => {

                const p1 = chan.subscribe('topic', (payload) => {
                    expect(payload).to.be.ok;
                    done();
                });

                const p2 = chan.subscribe('topic', () => void 0, (subscription) => {
                    subscription.dispose();
                });

                Promise.all([p1, p2]).then(() => chan.publish('topic', true));
            });
        });

        it('should throw an exception if the subscription is already disposed', (done) => {
            let channel_name = randomValidChannelOrTopicName();
            pubsub.channel(channel_name, (chan) => {

                chan.subscribe('topic', () => void 0).then(subscription => {
                    expect(subscription.isDisposed).to.be.false;
                    subscription.dispose();
                    expect(subscription.isDisposed).to.be.true;
                    expect(() => subscription.dispose()).to.throw();
                    done();
                });

            });
        });

        it('should run the callback after disposal', function(done) {
            let channel_name = randomValidChannelOrTopicName();
            pubsub.channel(channel_name, (channel) => {

                let callback = () => {
                    expect(true).to.be.true;
                    // it should run after disposal so publishing shouldn't run our
                    // subscription function
                    channel.publish('topic', 1);
                    setTimeout(done, 500);
                };

                // fail if this subscription is triggered
                channel.subscribe('topic', () => {
                    expect(false).to.be.true;
                }).then(subscription => {
                    subscription.dispose(callback);
                });

            });
        });
    });
}

if (typeof window === "undefined") {
    module.exports = {
        executeDisposeAndCleanupTests: executeDisposeAndCleanupTests
    };
}
