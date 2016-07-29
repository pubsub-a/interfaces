if (typeof window === "undefined") {
    var c = require("chai");
    var expect = c.expect;
    var Rx = require('rxjs/Rx');
    var randomValidChannelOrTopicName = require('../test_helper').randomValidChannelOrTopicName;
}

var executeStringValidationTests = (factory) => {
    let pubsub;

    describe(`[${factory.name} Channel name tests`, () => {

        beforeEach(done => {
            pubsub = factory.getPubSubImplementation();
            pubsub.start(() => {
                done();
            });
        });

        it("should make sure a channel name can only be of type string", () => {
            expect(() => pubsub.channel(undefined)).to.throw();
            expect(() => pubsub.channel(null)).to.throw();
            expect(() => pubsub.channel({})).to.throw();
            expect(() => pubsub.channel([])).to.throw();
            expect(() => pubsub.channel(['a'])).to.throw();
        });

        it("should make sure a channel name can consist of valid characters and be between 1 to 63 characters long", (done) => {
            let channel_generation = (length: number) => {
                const channel_name = randomValidChannelOrTopicName(length);
                pubsub.channel(channel_name);
            };

            Rx.Observable.range(1, 63).subscribe(length => {
                expect(() => channel_generation(length)).not.to.throw();
            }, undefined, done);
        });

        it("should make sure a channel name may not be longer than 63 characters", () => {
            let overlong_name = randomValidChannelOrTopicName(64);
            expect(() => pubsub.channel(overlong_name)).to.throw();
        });

        it("should make sure a channel with unallowed characters cannot be created", () => {
            expect(() => pubsub.channel("Foobar#")).to.throw();
            expect(() => pubsub.channel("Foobar1234+")).to.throw();
            expect(() => pubsub.channel("Foobar&")).to.throw();
            expect(() => pubsub.channel("Foobar$")).to.throw();
            expect(() => pubsub.channel("Foobar%")).to.throw();
            expect(() => pubsub.channel("Foobar§")).to.throw();
            expect(() => pubsub.channel("FoobarÖÄÜ")).to.throw();
            expect(() => pubsub.channel("Foobaré")).to.throw();
        });

        it("should make sure a channel with allowed characters can be created", () => {
            expect(() => pubsub.channel("Foobar1234_:/-")).not.to.throw();
        });

        it("should not allow the special sequence _$_ in a channel name", () => {
            expect(() => pubsub.channel("Foobar1234_$_Foobar")).to.throw();
        });

        it("should not allow the special sequence _%_ in a channel name", () => {
            expect(() => pubsub.channel("Foobar1234_$_Foobar")).to.throw();
        });
    });

    describe(`[${factory.name} Topic name tests`, () => {
        let channel;

        beforeEach(done => {
            pubsub = factory.getPubSubImplementation();
            let randomChannelName = randomValidChannelOrTopicName();
            pubsub.start(() => {
                pubsub.channel(randomChannelName, (chan) => {
                    channel = chan;
                    done();
                });
            });
        });

        it("should make sure a topic with allowed characters can be published to", () => {
            expect(() => channel.publish("Foobar1234_:/-")).not.to.throw();
        });

        it("should make sure a topic with special sequence can be published to", () => {
            expect(() => channel.publish("Foobar_$_Foobar")).not.to.throw();
            expect(() => channel.publish("Foobar_%_Foobar")).not.to.throw();
        });

    });
};

if (typeof window === "undefined") {
    module.exports = {
        executeStringValidationTests: executeStringValidationTests
    };
}
