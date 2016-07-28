if (typeof window === "undefined") {
    var c = require('chai');
    var expect = c.expect;
    var randomString = require('../test_helper').randomString;
    var randomValidChannelOrTopicName = require('../test_helper').randomValidChannelOrTopicName;
    var Rx = require('rxjs/Rx');
}

const executeCommonBasicPubSubTests = (factory) => {

    describe(`['${factory.name}] should pass the common PubSub implementation tests `, () => {

        var pubsub;
        var channel;

        // TODO doesnt get called for every "it" call
        beforeEach(done => {
            // increase the timeout
            pubsub = factory.getPubSubImplementation();
            pubsub.start(() => {
                var random = randomValidChannelOrTopicName();
                pubsub.channel(random, (chan) => {
                    channel = chan;
                    done();
                });
            });
        });


        it('should accept a subscription and fire it when published', (done) => {
            var subscriptionFunction = function() {
                expect(true).to.be.true;
                done();
            };

            channel.subscribe('myTopic', subscriptionFunction);
            channel.publish('myTopic', 1);

        });

        it('should handle multiple subscriptions in parallel', (done) => {
            var count1 = 0, count2 = 0;
            var promise1 = new Rx.AsyncSubject();
            var promise2 = new Rx.AsyncSubject();
            var num_additions = 100;

            var token1 = channel.subscribe('topic1', (value) => {
                count1 += value;
                if (count1 >= num_additions)
                    promise1.complete();
            });

            var token2 = channel.subscribe('topic2', (value) => {
                count2 += value;
                if (count2 >= num_additions)
                    promise2.complete();
            });

            var range = Rx.Observable.range(1, num_additions);

            range.subscribe(function() {
                channel.publish('topic1', 1);
            });

            range.subscribe(function() {
                channel.publish('topic2', 1);
            });

            Rx.Observable.concat(promise1, promise2).subscribe(undefined, undefined, () => {
                expect(count1).to.equal(num_additions);
                expect(count2).to.equal(num_additions);
                done();
            });
        });

        it('should fire multiple subscriptions', (done) => {

            var promise1 = new Rx.AsyncSubject();
            var promise2 = new Rx.AsyncSubject();


            channel.subscribe('myTopic', () => {
                promise1.complete();
            });

            channel.subscribe('myTopic', () => {
                promise2.complete();
            });

            channel.publish('myTopic', 1);

            Rx.Observable.concat(promise1, promise2).subscribe(undefined, undefined, () => {
                expect(true).to.be.true;
                done();
            });
        });

        it('should fire each subscription only once if multiple subscriptions are available', (done) => {
            var count = 0;

            channel.subscribe('topic', () => count += 1);
            channel.subscribe('topic', () => count += 1000);

            channel.publish('topic', true);

            // each subscription should have fired exactly one time
            setTimeout(function() {
                expect(count).to.equal(1001);
                done();
            }, 1000);
        });

        it('should execute the subscriptions in the order they were added', (done) => {
            var sequence = new Rx.Subject();

            sequence.take(3).toArray().subscribe(result => {
                expect(result).to.deep.equal([1, 2, 3]);
                done();
            });

            channel.subscribe('myTopic', () => sequence.next(1));
            channel.subscribe('myTopic', () => sequence.next(2));
            channel.subscribe('myTopic', () => {
                sequence.next(3);
                sequence.complete();
            });

            channel.publish('myTopic', 1);
        });

        it('should return the correct subscription counts', () => {
            var fn = function() { };
            var token1 = channel.subscribe('myTopic', fn);
            expect(token1.count).to.equal(1);
            var token2 = channel.subscribe('myTopic', fn);
            expect(token2.count).to.equal(2);
            var token3 = channel.subscribe('myTopic', fn);
            expect(token3.count).to.equal(3);

            var count = token1.dispose();
            expect(count).to.equal(2);
            count = token2.dispose();
            expect(count).to.equal(1);
            count = token3.dispose();
            expect(count).to.equal(0);
        });

        it('should trigger a subscribe of a different channel instance but same channel name', (done) => {
            var channel_name = randomString();

            pubsub.channel(channel_name, function(channel1) {
                pubsub.channel(channel_name, function(channel2) {

                    channel1.subscribe('topic', function(value) {
                        expect(value).to.be.true;
                        done();
                    });

                    channel2.publish('topic', true);
                });
            });
        });

        it('should trigger subscribes on different channel instances with same channel name', (done) => {
            var promise1 = new Rx.AsyncSubject();
            var promise2 = new Rx.AsyncSubject();
            var called1 = false;
            var called2 = false;

            var channel_name = randomString();

            pubsub.channel(channel_name, (channel1) => {
                pubsub.channel(channel_name, (channel2) => {

                    channel1.subscribe('topic', (value) => {
                        expect(value).to.be.true;
                        called1 = true;
                        promise1.complete();
                    });

                    channel2.subscribe('topic', (value) => {
                        expect(value).to.be.true;
                        called2 = true;
                        promise2.complete();
                    });

                    channel2.publish('topic', true);

                    Rx.Observable.concat(promise1, promise2).subscribe(undefined, undefined, () => {
                        expect(called1).to.be.true;
                        expect(called2).to.be.true;
                        done();
                    });
                });
            });
        });

        describe('dispose and cleanup methods', () => {

            it('should not dispose all identical subscriptions if a single one is disposed', (done) => {
                var channel_name = randomString();

                pubsub.channel(channel_name, function(channel) {

                    var subscription1 = channel.subscribe('topic', function(arg) {
                        expect(arg).to.be.ok;
                        done();
                    });

                    var subscription2 = channel.subscribe('topic', function() { });
                    subscription2.dispose();

                    channel.publish('topic', true);
                });

            });

            it('should throw an exception if the subscription is already disposed', (done) => {
                var channel_name = randomString();
                pubsub.channel(channel_name, function(channel) {

                    var subscription = channel.subscribe('topic', function() { });

                    expect(subscription.isDisposed).to.be.false;
                    subscription.dispose();
                    expect(subscription.isDisposed).to.be.true;
                    expect(() => subscription.dispose()).to.throw();
                    done();
                });
            });

            it('should run the callback after disposal', (done) => {
                var channel_name = randomString();
                pubsub.channel(channel_name, (channel) => {

                    var callback = (numSubscriptions) => {
                        expect(true).to.be.true;
                        // it should run after disposal so publishing shouldn't run our
                        // subscription function
                        channel.publish('topic', 1);
                        setTimeout(function() {
                            done();
                        }, 1000);
                    };

                    // fail if this subscription is triggered
                    var subscription = channel.subscribe('topic', () => {
                        expect(false).to.be.true;
                        done();
                    });

                    subscription.dispose(callback);
                });
            });
        });
    });

}

if (typeof window === "undefined") {
    module.exports = {
        executeCommonBasicPubSubTests: executeCommonBasicPubSubTests
    };
}
