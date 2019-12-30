# README

PubSub/A is an interface for libraries implementing the [Publish/Subscribe][pubsub-pattern]
pattern (also often referred to as Observer pattern). The aim of PubSub/A is to provide a unified,
asynchronous common API for pubsub (similiar to the Promise/A proposal that defined a unified API
for promises).

PubSub/A uses the so-called _topic-based Publish/Subscribe_ with the additional concept of
_channels_ for grouping together topics.

A [reference implementation written in TypeScript (but usable from plain JavaScript) is available
here][reference-implementation].

## Quick syntax overview

### Topic based

```javascript
const pubsub = new PubSubImplementation();

// channels are initialized asynchronously, provide a way to namespace topics
pubsub.channel('mychannel').then(channel => {

    // subscribe
    channel.subscribe('myTopic', arg => {
        console.log('I received a notification: ' + arg.message);
    })M

    // publish - you can pass any custom object as argument
    channel.publish('myTopic', { message: 'Hello world!' });
});
```

## Specification

The specification is included in the [SPECIFICIATION.md file](SPECIFICATION.md). The interface
definitions in this project are written as TypeScript interfaces to provide a statically typed API
for better understanding. As this project only includes interfaces and not actual implementations,
the resulting output from the TypeScript compiler is an empty JavaScript file.

## Implementations

-   [pubsub-micro] - A reference implementation written in TypeScript but usable from any JavaScript
    project

[pubsub-pattern]: https://en.wikipedia.org/wiki/Publish–subscribe_pattern
[reference-implementation]: https://github.com/pubsub-a/micro
[pubsub-micro]: https://github.com/pubsub-a/micro

## Test suite

An [official test suite](https://github.com/pubsub-a/tests) is available to test your
implementation for validity.

## License

MIT.
