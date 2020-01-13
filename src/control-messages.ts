export interface ClientDisconnect {
    type: "CLIENT_DISCONNECT";
    clientId: string;
    reason: "DISCONNECT" | "NOT_CONNECTED";
}

export interface UsageStats {
    type: "USAGE_STATS";
    numberOfConnectedClients: number;
}

export interface SubscribeDisconnect {
    type: "SUBSCRIBE_DISCONNECT";
    clientId: string;
}
export interface UnsubscribeDisconnect {
    type: "UNSUBSCRIBE_DISCONNECT";
    clientId: string;
}

export interface SubscribeUsageStats {
    type: "SUBSCRIBE_USAGE_STATS";
}
export interface UnsubscribeUsageStats {
    type: "UNSUBSCRIBE_USAGE_STATS";
}

/**
 * Informational message that are sent to the client
 */
export type ControlMessage = ClientDisconnect | UsageStats;

/**
 * Commands a client might send to the server. Reserved for implementation specific
 * commands
 */
export type ControlCommand = never;

/**
 * Subscribe to specific mesages which will be received via the ControlMessage
 * channel
 */
export type ControlSubscribe = SubscribeDisconnect | SubscribeUsageStats;

/**
 * Unsubcribe to specific mesages which will be received via the ControlMessage
 * channel
 */
export type ControlUnsubscribe = UnsubscribeDisconnect | UnsubscribeUsageStats;

export interface ControlChannelSubscribeMap {
    CONTROL: ControlMessage;
}

export interface ControlChannelPublishMap {
    CONTROL_SUBSCRIBE: ControlSubscribe;
    CONTROL_UNSUBSCRIBE: ControlUnsubscribe;
    CONTROL_COMMAND: ControlCommand;
}
