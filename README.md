README
=======

PubSub/A is an interface for libraries implementing the [Publish/Subscribe][pubsub-pattern]
pattern (also often referred to as Observer pattern). The aim of PubSub/A is to provide a unified,
asynchronous common API for pubsub (similiar to the Promise/A proposal that defines a unified API
for promises).

PubSub/A uses the so-called *topic-based Publish/Subscribe* with the additional concept of
*channels* for grouping together topics.

A [reference implementation written in TypeScript (but usable from plain JavaScript) is available
here][reference-implementation].


Quick syntax overview
------

### Topic based

```javascript
var pubsub = new PubSubImplementation();

// channels are initialized asynchronously, provide a way to "namespace" topics
pubsub.channel('mychannel', function(channel) {

    // subscribe
    channel.subscribe('myTopic', function(arg) {
        console.log('I received a notification: ' + arg.message);
    });

    // publish - you can pass any custom object as argument
    channel.publish('myTopic', { message: 'Hello world!' });
});
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


  [pubsub-pattern]: https://en.wikipedia.org/wiki/Publish–subscribe_pattern
  [reference-implementation]: https://github.com/pubsub-a/pubsub-micro
  [pubsub-micro]: https://github.com/pubsub-a/pubsub-micro


Test suite
----------

This project includes a number of unit tests (using Mocha/Chai and Karma) that can be used to verify
compatibility with the spec. To add you implementation, add a reference to the `karma.conf.js` file
and register a factory that returns your PubSubImplemenation and start Karma. For node.js tests, see the
`tests/test.js` file for how to extend the test suite with your implementation.


Licensing
---------

This project does not include any actual code that you could license (see the individual
implementations for their licensing). The documentation and test suite contained in this project are
licensed under the GNU AGPL v3.
