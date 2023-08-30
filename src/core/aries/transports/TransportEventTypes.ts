import type { BaseEvent } from '@aries-framework/core'

export enum TransportEventTypes {
  OutboundWebSocketClosedEvent = 'OutboundWebSocketClosedEvent',
  OutboundWebSocketOpenedEvent = 'OutboundWebSocketOpenedEvent',
}

export interface OutboundWebSocketClosedEvent extends BaseEvent {
  type: TransportEventTypes.OutboundWebSocketClosedEvent
  payload: {
    socketId: string
    connectionId?: string
  }
}

export interface OutboundWebSocketOpenedEvent extends BaseEvent {
  type: TransportEventTypes.OutboundWebSocketOpenedEvent
  payload: {
    socketId: string
    connectionId?: string
  }
}
