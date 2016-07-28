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
        });

        it("should make sure a channel name can consist of valid characters and be between 1 to 255 characters long", (done) => {
            let channel_generation = (length: number) => {
                const channel_name = randomValidChannelOrTopicName(length);
                pubsub.channel(channel_name);
            };

            Rx.Observable.range(1, 255).subscribe(length => {
                expect(() => channel_generation(length)).not.to.throw();
            }, undefined, done);
        });

        it("should make sure a channel name may not be longer than 255 characters", () => {
            let overlong_name = randomValidChannelOrTopicName(256);
            expect(() => pubsub.channel(overlong_name)).to.throw();
        });
    });
};

if (typeof window === "undefined") {
    module.exports = {
        executeStringValidationTests: executeStringValidationTests
    };
}
