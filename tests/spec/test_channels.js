if (typeof window === "undefined") {
    var chai = require('chai');
    var expect = chai.expect;
    var Rx = require('rxjs/Rx');
}

function executeChannelTests(factory) {

    describe('[' + factory.name + '] should pass common channel tests', function() {

        beforeEach(function(done) {
            pubsub = factory.getPubSubImplementation();
            pubsub.start(function() {
                done();
            });
        });

        function expectToBeAChannel(channel) {
            expect(channel.publish).to.be.a.function;
            expect(channel.subscribe).to.be.a.function;
            expect(channel.name).to.be.a.string;
            expect(channel.name).length.to.be.above(0);
        }

        it("should create a channel asynchronously", function(done) {
            var channel;

            pubsub.channel("foo", function(chan) {
                expectToBeAChannel(chan);
                done();
            });
        });

        it("should create a channel synchronously and return a promise", function() {
            var channel;

            var promise = pubsub.channel("foo");
            expect(promise).to.be.defined;
            expect(promise.then).to.be.a("function");
            expect(promise.catch).to.be.a("function");

        });

        it("if the .channel() returns a promise, it should resolve with the channel", function(done) {
            var channel;

            var promise = pubsub.channel("foo");

            promise.then(function(channel) {
                expectToBeAChannel(channel);
                done();
            });

        });

        it("should not share pubsub data between two channels of different name", function(done) {
            var channel1, channel2;
            var channel1_ready = new Rx.AsyncSubject();
            var channel2_ready = new Rx.AsyncSubject();

            // TODO use Promise/rxjs magic to start
            pubsub.channel("channel1", function(chan) {
                channel1 = chan;
                channel1_ready.complete();
            });
            pubsub.channel("channel2", function(chan) {
                channel2 = chan;
                channel2_ready.complete();
            });

            Rx.Observable.concat(channel1_ready, channel2_ready).subscribe(undefined, undefined, function() {

                channel1.subscribe("foo", function() {
                    expect(true).to.be.true;
                    setTimeout(done, 500);
                });

                // if this is called, data is shared amgonst differently named channels so we fail
                channel2.subscribe("foo", function() {
                    expect(false).to.be.true;
                });

                channel1.publish("foo", {});
            });
        });

        it("should have two channel instances with same name share the pubsub data", function(done) {
            var channel1, channel2;
            var channel1_ready = new Rx.AsyncSubject();
            var channel2_ready = new Rx.AsyncSubject();

            pubsub.channel("foo", function(chan) {
                channel1 = chan;
                channel1_ready.complete();
            });
            pubsub.channel("foo", function(chan) {
                channel2 = chan;
                channel2_ready.complete();
            });

            Rx.Observable.concat(channel1_ready, channel2_ready).subscribe(undefined, undefined, function() {

                channel1.subscribe("bar", function() {
                    expect(true).to.be.true;
                    done();
                });

                channel2.publish("bar", {});
            });
        });
    });
}

if (typeof window === "undefined") {
    module.exports = {
        executeChannelTests: executeChannelTests
    };
}
