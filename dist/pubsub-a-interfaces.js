"use strict";
var InternalChannelTopic = (function () {
    function InternalChannelTopic() {
    }
    InternalChannelTopic.CLIENT_DISCONNECT = "client_disconnect";
    InternalChannelTopic.SUBSCRIBE_DISCONNECT = "subscribe_disconnect";
    InternalChannelTopic.UNSUBSCRIBE_DISCONNECT = "unsubscribe_disconnect";
    return InternalChannelTopic;
}());
exports.InternalChannelTopic = InternalChannelTopic;