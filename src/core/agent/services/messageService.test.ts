import {
  Agent,
  BasicMessageEventTypes,
  BasicMessageStateChangedEvent,
  DidExchangeState,
} from "@aries-framework/core";
import { EventEmitter } from "events";
import { EventMetadata } from "@aries-framework/core/build/agent/Events";
import { MessageService } from "./messageService";
import { SignifyApi } from "../modules/signify/signifyApi";

const eventEmitter = new EventEmitter();

const agent = jest.mocked({
  messagePickup: {
    pickupMessages: jest.fn(),
  },
  connections: {
    findAllByConnectionTypes: jest.fn().mockResolvedValue([]),
  },
  basicMessages: {
    sendMessage: jest.fn(),
  },
  events: {
    on: eventEmitter.on.bind(eventEmitter),
  },
  eventEmitter: {
    emit: eventEmitter.emit.bind(eventEmitter),
  },
});

const basicStorage = jest.mocked({
  open: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const signifyApi = jest.mocked({});

const messageService = new MessageService(
  agent as any as Agent,
  basicStorage,
  signifyApi as any as SignifyApi
);

describe("Message service of agent - BasicMessageRecord helper", () => {
  test("should emit event when basic message state changed", async () => {
    const callback = jest.fn();
    const event: BasicMessageStateChangedEvent = {
      type: BasicMessageEventTypes.BasicMessageStateChanged,
      payload: {} as BasicMessageStateChangedEvent["payload"],
      metadata: {} as EventMetadata,
    };
    messageService.onBasicMessageStateChanged(callback);
    eventEmitter.emit(BasicMessageEventTypes.BasicMessageStateChanged, event);
    expect(callback).toBeCalledWith(event);
  });
});

describe("Message service of agent", () => {
  test("should not return mediator connectionId", async () => {
    const connectionId = await messageService.getMediatorConnectionId();
    expect(connectionId).toBeUndefined();
  });

  test("should return mediator connectionId", async () => {
    jest
      .spyOn(agent.connections, "findAllByConnectionTypes")
      .mockResolvedValue([
        {
          id: "connectionId",
          state: DidExchangeState.Completed,
        },
      ]);
    const connectionId = await messageService.getMediatorConnectionId();
    expect(connectionId).toEqual("connectionId");
  });

  test("should pickup messages successfully", async () => {
    jest
      .spyOn(agent.connections, "findAllByConnectionTypes")
      .mockResolvedValue([
        {
          id: "connectionId",
          state: DidExchangeState.Completed,
        },
      ]);
    const pickupMessagesSpy = jest.spyOn(agent.messagePickup, "pickupMessages");
    await messageService.pickupMessagesFromMediator();
    expect(pickupMessagesSpy).toBeCalledWith({
      connectionId: "connectionId",
      protocolVersion: "v2",
    });
  });

  test("should pickup messages successfully with protocol version v1", async () => {
    jest
      .spyOn(agent.connections, "findAllByConnectionTypes")
      .mockResolvedValue([
        {
          id: "connectionId",
          state: DidExchangeState.Completed,
        },
      ]);
    const pickupMessagesSpy = jest.spyOn(agent.messagePickup, "pickupMessages");
    await messageService.pickupMessagesFromMediator("v1");
    expect(pickupMessagesSpy).toBeCalledWith({
      connectionId: "connectionId",
      protocolVersion: "v1",
    });
  });

  test("should send message successfully", async () => {
    const sendMessageSpy = jest.spyOn(agent.basicMessages, "sendMessage");
    await messageService.sendMessage("connectionId", "message");
    expect(sendMessageSpy).toBeCalledWith("connectionId", "message");
  });
});
