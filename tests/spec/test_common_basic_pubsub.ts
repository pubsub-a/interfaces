if (typeof window === "undefined") {
    let c = require('chai');
    var expect = c.expect;
    var randomValidChannelOrTopicName = require('../test_helper').randomValidChannelOrTopicName;
    var Rx = require('rxjs/Rx');
    var Promise = require("es6-promise").Promise;
}

const executeCommonBasicPubSubTests = (factory) => {

    describe(`['${factory.name}] should pass the common PubSub implementation tests `, () => {

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


        it('should accept a subscription and fire it when published', (done) => {
            let subscriptionFunction = () => {
                expect(true).to.be.true;
                done();
            };

            channel.subscribe('myTopic', subscriptionFunction).then(() => {
                channel.publish('myTopic', 1);
            });

        });

        it('should handle multiple subscriptions in parallel', (done) => {
            let count1 = 0, count2 = 0;
            let promise1 = new Rx.AsyncSubject();
            let promise2 = new Rx.AsyncSubject();
            let num_additions = 100;

            let p1 = channel.subscribe('topic1', (value) => {
                count1 += value;
                if (count1 >= num_additions)
                    promise1.complete();
            });

            let p2 = channel.subscribe('topic2', (value) => {
                count2 += value;
                if (count2 >= num_additions)
                    promise2.complete();
            });

            Promise.all([p1, p2]).then(() => {
                Rx.Observable.concat(promise1, promise2).subscribe(undefined, undefined, () => {
                    expect(count1).to.equal(num_additions);
                    expect(count2).to.equal(num_additions);
                    done();
                });

                let range = Rx.Observable.range(1, num_additions);
                range.subscribe(() => channel.publish('topic1', 1));
                range.subscribe(() => channel.publish('topic2', 1));
            });
        });

        it('should fire multiple subscriptions', (done) => {

            let promise1 = new Rx.AsyncSubject();
            let promise2 = new Rx.AsyncSubject();

            let p1 = channel.subscribe('myTopic', () => {
                promise1.complete();
            });

            let p2 = channel.subscribe('myTopic', () => {
                promise2.complete();
            });

            Promise.all([p1, p2]).then(() => {
                channel.publish('myTopic', 1);
            });

            Rx.Observable.concat(promise1, promise2).subscribe(undefined, undefined, () => {
                expect(true).to.be.true;
                done();
            });
        });

        it('should fire each subscription only once if multiple subscriptions are available', (done) => {
            let count = 0;

            const p1 = channel.subscribe('topic', () => count += 1);
            const p2 = channel.subscribe('topic', () => count += 1000);

            Promise.all([p1, p2]).then(() => channel.publish('topic', true));

            // each subscription should have fired exactly one time
            // TODO use promises over setTimeout
            setTimeout(function() {
                expect(count).to.equal(1001);
                done();
            }, 1000);
        });

        it('should execute the subscriptions in the order they were added', (done) => {
            let sequence = new Rx.Subject();

            sequence.take(3).toArray().subscribe(result => {
                expect(result).to.deep.equal([1, 2, 3]);
                done();
            });

            let p1 = channel.subscribe('myTopic', () => sequence.next(1));
            let p2 = channel.subscribe('myTopic', () => sequence.next(2));
            let p3 = channel.subscribe('myTopic', () => {
                sequence.next(3);
                sequence.complete();
            });

            Promise.all([p1, p2, p3]).then(() => channel.publish('myTopic', 1));
        });

        it("should fire a subscription if it is registered with .once()", (done) => {
            const topic = randomValidChannelOrTopicName();
            const promise =  channel.once(topic, (payload) => {
                expect(payload).to.equal("foo");
                done();
            });

            promise.then(subs => {
                channel.publish(topic, "foo");
            });
        });


        it("should fire a subscription only once if it is registered with .once()", (done) => {
            const topic = randomValidChannelOrTopicName();
            let counter = 0;
            const promise = channel.once(topic, (payload) => {
                expect(payload).to.equal("foo");
                expect(counter).to.equal(0);
                counter++;
                done();
            });
            promise.then(subs => {
                channel.publish(topic, "foo");
                channel.publish(topic, "foo");
            });
        });

        it("should set the subscription isDisposed to true after it got disposed", (done) => {
            const topic = "topci";
            let observerFinished;
            let promise;

            observerFinished = new Promise((resolve) => {
                promise = channel.once(topic, (payload) => {
                    expect(payload).to.equal("foo");
                    resolve();
                });
            });

            promise.then(subs => {
                expect(subs.isDisposed).to.be.false;
                channel.publish(topic, "foo");

                observerFinished.then(() => {
                    expect(subs.isDisposed).to.be.true;
                    done();
                });
            });
        });

        it('should return the correct subscription counts', () => {
            let fn = () => void 0;
            let promise1 = channel.subscribe('myTopic', fn).then(t1 => {
                expect(t1.count).to.equal(1);
            });
            let promise2 = channel.subscribe('myTopic', fn).then(t2 => {
                expect(t2.count).to.equal(2);
            });
            let promise3 = channel.subscribe('myTopic', fn).then(t3 => {
                expect(t3.count).to.equal(3);
            });

            Promise.all([promise1, promise2, promise3]).then(tokens => {
                let [token1, token2, token3] = tokens;
                let count = token1.dispose();
                expect(count).to.equal(2);
                count = token2.dispose();
                expect(count).to.equal(1);
                count = token3.dispose();
                expect(count).to.equal(0);
            });
        });

        it("should call the subscription registered callback for .subscribe() with the correct arguments", (done) => {
            const topic = randomValidChannelOrTopicName();
            const observer = () => void 0;
            channel.subscribe(topic, observer, (subscription, subscribedTopic) => {
                expect(subscription).to.be.ok;
                expect(subscription.dispose).to.be.ok;
                expect(subscribedTopic).to.equal(topic);
                done();
            });
        });

        it("should call the subscription registered callback for .once() with the correct arguments", (done) => {
            const topic = randomValidChannelOrTopicName();
            const observer = () => void 0;
            channel.once(topic, observer, (subscription, subscribedTopic) => {
                expect(subscription).to.be.ok;
                expect(subscription.dispose).to.be.ok;
                expect(subscribedTopic).to.equal(topic);
                done();
            });
        });
    });

}

if (typeof window === "undefined") {
    module.exports = {
        executeCommonBasicPubSubTests: executeCommonBasicPubSubTests
    };
}
