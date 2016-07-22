if (typeof window === "undefined") {
    var chai = require('chai');
    var expect = chai.expect;
    var Rx = require('rxjs/Rx');
}

function executeChannelTests(getPubSubImplementation) {

    describe('should pass common channel tests', function() {

        beforeEach(function(done) {
            pubsub = getPubSubImplementation();
            pubsub.start(function() {
                done();
            });
        });

        it("should create a channel asynchronously", function(done) {
            var channel;

            pubsub.channel("foo", function(chan) {
                expect(chan.constructor.name).to.equal("Channel");
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
                    setTimeout(done, 250);
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
            // TODO use Promise/rxjs magic to start
            var i = 2;
            pubsub.channel("foo", function(chan) {
                channel1 = chan;
                i--;
                go();
            });
            pubsub.channel("foo", function(chan) {
                channel2 = chan;
                i--;
                go();
            });

            function go() {
                if (i !== 0) return;

                channel1.subscribe("bar", function() {
                    expect(true).to.be.true;
                    done();
                });

                channel2.publish("bar", {});
            }
        });
    });
}

if (typeof window === "undefined") {
    module.exports = {
        executeChannelTests: executeChannelTests
    };
}
