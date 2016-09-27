
if (typeof window === "undefined") {
    let c = require("chai");
    var expect = c.expect;
    var Rx = require('rxjs/Rx');
    var Promise = require("es6-promise").Promise;
}

const executeDisconnectTests = (factory) => {

    let pubsub1, pubsub2;
    let channel1, channel2;

    describe(`[${factory.name}] should pass disconnect event tests`, () => {

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

        it("should be able to disconnect and the stop callback gets called", function(done) {
            pubsub1.stop(() => {
                expect(true).to.be.true;
                done();
            });
        });

        it("should be able to subscribe to a disconnect event", function(done) {
            if (!pubsub1.pubsub.socket || !pubsub1.pubsub.socket.id) {
                this.skip();
                return;
            }

            const id1 = pubsub1.pubsub.socket.id;
            const id2 = pubsub2.pubsub.socket.id;

            // client1 wants to be notified if client2 disconnects
            pubsub1.channel("__internal", (internalChannel) => {
                internalChannel.subscribe("client_disconnected", (clientUuid) => {
                    expect(clientUuid).to.equal(id2);
                    done();
                });
                internalChannel.publish("subscribe_disconnect", id2);
                setTimeout(() => {
                    pubsub2.stop();
                }, 500);
            });
        });
    });
}

if (typeof window === "undefined") {
    module.exports = {
        executeDisconnectTests: executeDisconnectTests
    };
}
