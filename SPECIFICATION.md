PubSub/A Specification
======================

A statically typed interface definition containing various types and call signatures is included as
TypeScript interfaces in this project and serve as normative reference in addition to this
document. Additionally, a unit test suite is included in this project which also defines the
behaviour of a correct implementation.

Definitions
-----------

* `PubSub/A` - this specification proposal
* PubSubImplementation - an implementation implementing this specification


Implementation instances
------------------------

Publish/Subscribe operations are always specific to the PubSubImplementation instances they are
created on. That means that different PubSubImplementation instances MUST NOT trigger subscriptions
when published on a different instance.

Example:

```javascript
var instance1 = new PubSubImplementation();
var instance2 = new PubSubImplementation();

instance1.subscribe('topic', function() {
   // if we reach this, your implementation is faulty
   throw Execption('implementation is faulty!'); 
});

instance2.publish('topic', {});
```

This does not apply to network enabled implementations where instances may exist across different
machines. In networking scenarios, two instances on different machines are considered the same
instance if they share the same backend server or URI string.


Asynchonous establishment of channels
-------------------------------------

Channels might be setup up asynchronously. Therefore any implementation must buffer published
messages and publish them when the channel becomes ready.

```javascript
var pubsub = new PubSubImplementation();
var channel;

// synchronous usage of the API...
channel = pubsub.channel('myChannel');
channel.publish('topic', arg);

// ...MUST BE equivalent to the following asynchronous usage
pubsub.channel('myChannel', function(channel) {
  channel.publish('topic', arg); 
});

```

!! WORK IN PROGRESS - MORE TO COME !!
-------------------------------------