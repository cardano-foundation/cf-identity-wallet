import EventEmitter from "events";
import { BaseEventEmitter } from "./event.types";

type EmitEvent<T extends BaseEventEmitter> = Omit<T, "metadata">;

class CoreEventEmitter {
  private eventEmitter: EventEmitter;
  constructor() {
    this.eventEmitter = new EventEmitter();
  }
  emit<T extends BaseEventEmitter>(data: EmitEvent<T>): void {
    this.eventEmitter.emit(data.type, data);
  }
  on<T extends BaseEventEmitter>(
    event: T["type"],
    listener: (data: T) => void | Promise<void>
  ) {
    this.eventEmitter.on(event, listener);
  }
  off<T extends BaseEventEmitter>(
    event: T["type"],
    listener: (data: T) => void | Promise<void>
  ) {
    this.eventEmitter.off(event, listener);
  }
}

export { CoreEventEmitter };
