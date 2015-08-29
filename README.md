README
=======

PubSub/A is an interface proposal for libraries implementing the [Publish/Subscribe][pubsub-pattern]
pattern (also often referred to as Observer pattern). The aim of PubSub/A is to provide a unified,
asynchronous common API for pubsub (similiar to the Promise/A proposal that defines a unified API
for promises).

PubSub/A uses the so-called *topic-based Publish/Subscribe* with the additional concept of
*channels* for grouping together topics. But besides string topics, it is also possible to use
custom object instance (or DOM nodes) as message hubs.

A [reference implementation written in TypeScript (but usable from plain JavaScript) is available
here][reference-implementation], as well as a
[network-transparent implementation][pubsub-server-node] that allows publish/subscribe across
node.js and browser instances using WebSockets.


Quick syntax overview
------

### Topic based

```javascript
var pubsub = new PubSubImplementation();

// channels are used to group topics
var channel = pubsub.channel('mychannel');

// subscribe
channel.subscribe('myTopic', function(arg) {
  console.log('I received a notification: ' + arg.message);
});

// publish - you can pass any custom object as argument
channel.publish('myTopic', { message: 'Hello world!' });

```

### Object-instance based (no string topics)

```javascript
var pubsub = new PubSubImplementation();

// use any object instance or DOM node you like
var myObject = {};

// add publish/subscribe functions to the object
PubSubImplementation.includeIn(myObject);

myObject.subscribe(function(arg) {
  console.log('I received a notification: ' + arg.message);
});

// publish - you can pass any custom object as argument
myObject.publish({ message: 'Hello world!' });
```

Specification
-------------

The specification is included in the [SPECIFICIATION.md file](SPECIFICATION.md). The interface
definitions in this project are written as TypeScript interfaces to provide a statically typed API
for better understanding. As this project only includes interfaces and not actual implementations,
the resulting output from the TypeScript compiler is an empty JavaScript file.

Implementations
---------------

* [pubsub-micro] - A reference implementation written in TypeScript but usable from any JavaScript
  project
* [pubsub-server-node] - A network-transparent implementation that can forward publish/subscribe
  message through the web (via WebSockets) using a tiny node.js server


  [pubsub-pattern]: https://en.wikipedia.org/wiki/Publish–subscribe_pattern
  [reference-implementation]: https://github.com/pubsub-a/pubsub-micro
  [pubsub-micro]: https://github.com/pubsub-a/pubsub-micro
  [pubsub-server-node]: https://github.com/pubsub-a/pubsub-server-node


Test suite
----------

This project includes a number of unit tests (using Jasmine and Karma) that can be used to verify
compatibility with the spec. To add you implementation, add a reference to the `karma.conf.js` file
and register a factory that returns your PubSubImplemenation and start Karma.


Licensing
---------

This project does not include any actual code that you could license (see the individual
implementations for their licensing). The documentation and test suite contained in this project are
licensed under the GNU AGPL v3.
