var chai = require('chai');
var testHelper = require('../test_helper');
var Rx = require('rx');

var expect = chai.expect;

function executeCommonBasicPubSubTests(getPubSubImplementation) {

  describe('should pass the common PubSub implementation tests ', function() {

    var pubsub;
    var channel;
    var originalTimeout;

    // TODO doesnt get called for every "it" call
    beforeEach (function(done) {
      // increase the timeout
      pubsub = getPubSubImplementation();
      pubsub.start(function() {
        var random = testHelper.randomString();
        pubsub.channel(random, function(chan) {
          channel = chan;
          done();
        });
      });

    });


    it ('should accept a subscription and fire it when published', function(done) {
      var subscriptionFunction = function() {
        expect(true).to.be.true;
        done();
      };

      channel.subscribe ('myTopic', subscriptionFunction);
      channel.publish ('myTopic', 1);

    });

    it ('should handle multiple subscriptions in parallel', function(done) {
      var count1 = 0, count2 = 0;
      var promise1 = new Rx.AsyncSubject();
      var promise2 = new Rx.AsyncSubject();
      var num_additions = 100;

      var token1 = channel.subscribe ('topic1', function(value) {
        count1 += value;
        if (count1 >= num_additions)
          promise1.onCompleted();
      });

      var token2 = channel.subscribe ('topic2', function(value) {
        count2 += value;
        if (count2 >= num_additions)
          promise2.onCompleted();
      });

      var range = Rx.Observable.range(1, num_additions);

      range.subscribe (function() {
        channel.publish ('topic1', 1);
      });

      range.subscribe (function() {
        channel.publish ('topic2', 1);
      });

      Rx.Observable.concat(promise1, promise2).subscribeOnCompleted(function() {
        expect(count1).to.equal(num_additions);
        expect(count2).to.equal(num_additions);
        done();
      });
    });

    it ('should fire multiple subscriptions', function(done) {

      var promise1 = new Rx.AsyncSubject();
      var promise2 = new Rx.AsyncSubject();


      channel.subscribe ('myTopic', function() {
        promise1.onCompleted();
      });

      channel.subscribe ('myTopic', function() {
        promise2.onCompleted();
      });

      channel.publish ('myTopic', 1);

      Rx.Observable.concat(promise1, promise2).subscribeOnCompleted(function() {
        expect(true).to.be.true;
        done();
      });
    });

    it ('should fire each subscription only once if multiple subscriptions are available', function(done) {
      var promise1 = new Rx.AsyncSubject();
      var promise2 = new Rx.AsyncSubject();
      var count = 0;

      channel.subscribe('topic', function() {
        count += 1;
      });

      channel.subscribe('topic', function() {
        count += 1000;
      });

      channel.publish('topic', true);

      // each subscription should have fired exactly one time
      setTimeout(function() {
        expect(count).to.equal(1001);
        done();
      }, 1000);
    });

    it ('should execute the subscriptions in the order they were added', function(done) {
      var sequence = new Rx.Subject ();

      sequence.take(3).toArray().subscribe (function(result) {
        expect(result).to.deep.equal([1, 2, 3]);
        done();
      });

      channel.subscribe ('myTopic', function() {
        sequence.onNext(1);
      });
      channel.subscribe ('myTopic', function() {
        sequence.onNext(2);
      });
      channel.subscribe ('myTopic', function() {
        sequence.onNext(3);
        sequence.onCompleted();
      });

      channel.publish ('myTopic', 1);
    });

    it ('should return the correct subscription counts', function() {
      var fn = function() {};
      var token1 = channel.subscribe ('myTopic', fn);
      expect(token1.count).to.equal(1);
      var token2 = channel.subscribe ('myTopic', fn);
      expect(token2.count).to.equal(2);
      var token3 = channel.subscribe ('myTopic', fn);
      expect(token3.count).to.equal(3);

      var count = token1.dispose();
      expect(count).to.equal(2);
      count = token2.dispose();
      expect(count).to.equal(1);
      count = token3.dispose();
      expect(count).to.equal(0);
    });

    it ('should trigger a subscribe of a different channel instance but same channel name', function(done) {
      var channel_name = testHelper.randomString();

      pubsub.channel(channel_name, function(channel1) {
        pubsub.channel(channel_name, function(channel2) {

          channel1.subscribe('topic', function(value) {
            expect(value).to.be.true;
            done();
          });

          channel2.publish ('topic', true);
        });
      });
    });

    it ('should trigger subscribes on different channel instances with same channel name', function(done) {
      var promise1 = new Rx.AsyncSubject();
      var promise2 = new Rx.AsyncSubject();
      var called1 = false;
      var called2 = false;

      var channel_name = testHelper.randomString();

      pubsub.channel(channel_name, function(channel1) {
        pubsub.channel(channel_name, function(channel2) {

          channel1.subscribe('topic', function(value) {
            expect(value).to.be.true;
            called1 = true;
            promise1.onCompleted();
          });

          channel2.subscribe('topic', function(value) {
            expect(value).to.be.true;
            called2 = true;
            promise2.onCompleted();
          });

          channel2.publish ('topic', true);

          Rx.Observable.concat(promise1, promise2).subscribeOnCompleted(function() {
            expect(called1).to.be.true;
            expect(called2).to.be.true;
            done();
          });
        });
      });
    });

    describe('dispose and cleanup methods', function() {

      it ('should not dispose all identical subscriptions if a single one is disposed', function(done) {
        var channel_name = testHelper.randomString();

        pubsub.channel(channel_name, function(channel) {

          var subscription1 = channel.subscribe('topic', function(arg) {
            expect(arg).to.be.ok;
            done();
          });

          var subscription2 = channel.subscribe('topic', function() {});
          subscription2.dispose();

          channel.publish('topic', true);
        });

      });

      it ('should throw an exception if the subscription is already disposed', function(done) {
        var channel_name = testHelper.randomString();
        pubsub.channel(channel_name, function(channel) {

          var subscription = channel.subscribe('topic', function() {});

          expect(subscription.isDisposed).to.be.false;
          subscription.dispose();
          expect(subscription.isDisposed).to.be.true;
          expect(function() { subscription.dispose(); }).to.throw();
          done();
        });
      });

      it ('should run the callback after disposal', function(done) {
        var channel_name = testHelper.randomString();
        pubsub.channel(channel_name, function(channel) {

          var callback = function(numSubscriptions) {
            expect(true).to.be.true;
            // it should run after disposal so publishing shouldn't run our
            // subscription function
            channel.publish('topic', 1);
            setTimeout(function() {
              done();
            }, 1000);
          };

          // fail if this subscription is triggered
          var subscription = channel.subscribe('topic', function() {
            expect(false).to.be.true;
            done();
          });

          subscription.dispose(callback);
        });
      });
    });
  });

}

module.exports = {
  executeCommonBasicPubSubTests: executeCommonBasicPubSubTests
};
