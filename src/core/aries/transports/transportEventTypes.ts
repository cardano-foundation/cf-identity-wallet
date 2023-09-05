import type { BaseEvent } from "@aries-framework/core";

enum TransportEventTypes {
  OutboundWebSocketClosedEvent = "OutboundWebSocketClosedEvent",
  OutboundWebSocketOpenedEvent = "OutboundWebSocketOpenedEvent",
}

interface OutboundWebSocketClosedEvent extends BaseEvent {
  type: TransportEventTypes.OutboundWebSocketClosedEvent;
  payload: {
    socketId: string;
    connectionId?: string;
  };
}

interface OutboundWebSocketOpenedEvent extends BaseEvent {
  type: TransportEventTypes.OutboundWebSocketOpenedEvent;
  payload: {
    socketId: string;
    connectionId?: string;
  };
}

export type { OutboundWebSocketClosedEvent, OutboundWebSocketOpenedEvent };
export { TransportEventTypes };
