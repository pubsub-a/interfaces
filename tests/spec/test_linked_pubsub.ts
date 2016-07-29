if (typeof window === "undefined") {
    let c = require("chai");
    var expect = c.expect;
    var Rx = require('rxjs/Rx');
    var randomValidChannelOrTopicName = require('../test_helper').randomValidChannelOrTopicName;
}

const executeLinkedPubSubTests = (factory) => {

    let pubsub1, pubsub2;
    let channel1, channel2;

    describe(`[${factory.name}] should pass basic linked pubsub tests`, () => {

        beforeEach(done => {
            [ pubsub1, pubsub2 ] = factory.getLinkedPubSubImplementation(2);

            let channel1_ready = new Rx.AsyncSubject();
            let channel2_ready = new Rx.AsyncSubject();

            let channel_name = "channel";

            pubsub1.start(pubsub => {
                pubsub1.channel(channel_name, (chan) => {
                    channel1 = chan;
                    channel1_ready.complete();
                });
            });
            pubsub2.start(pubsub => {
                pubsub2.channel(channel_name, (chan) => {
                    channel2 = chan;
                    channel2_ready.complete();
                });
            });

            Rx.Observable.concat(channel1_ready, channel2_ready).subscribe(undefined, undefined, () => {
                done();
            });
        });

        it("should receive a simple publish across linked instances", done => {
            let topic = "topic";
            channel1.subscribe(topic, payload => {
                expect(payload).to.equal("foobar");
                done();
            });

            channel2.publish(topic, "foobar");
        });

        it("should fire the local subscription only once if we locally publish", done => {
            let topic = "topic";
            channel1.subscribe(topic, payload => {
                expect(payload).to.equal("foobar");
                done();
            });
            channel1.publish(topic, "foobar");
        });


        it("should handle tenthousand subscriptions simultaneously", function(done) {
            // set timeout to a minute for this test
            this.timeout(60000);
            let numRuns = 100000;
            let check = (payload) => { expect(payload).to.equal("foobar"); };
            while(numRuns > 0) {
                let subscription = channel1.subscribe("topic", check);
                channel2.publish("topic", "foobar");
                subscription.dispose();
                if (--numRuns == 0) {
                    setTimeout(done, 2000);
                }
            };

        });

    });
};

if (typeof window === "undefined") {
    module.exports = {
        executeLinkedPubSubTests: executeLinkedPubSubTests
    };
}
