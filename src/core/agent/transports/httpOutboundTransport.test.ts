import {
  AgentDependencies,
  Agent,
  InitConfig,
  OutboundPackage,
  JsonEncoder,
  AgentEventTypes,
  EncryptedMessage,
} from "@aries-framework/core";
import { CapacitorFileSystem } from "../dependencies";
import { IonicStorageModule } from "../modules";
import { HttpOutboundTransport } from "./httpOutboundTransport";

const emitEventMock = jest.fn();
const eventEmitterMock = jest.fn().mockReturnValue({
  emit: emitEventMock,
});

// @TODO - foconnor: Agent setup for these various scenarios should be abstracted to a common place
const agentDependencies: AgentDependencies = {
  FileSystem: CapacitorFileSystem,
  EventEmitterClass:
    eventEmitterMock as unknown as AgentDependencies["EventEmitterClass"],
  fetch: global.fetch as unknown as AgentDependencies["fetch"],
  WebSocketClass:
    global.WebSocket as unknown as AgentDependencies["WebSocketClass"],
};

const config: InitConfig = {
  label: "idw-agent",
  walletConfig: {
    id: "idw",
    key: "idw",
  },
};

let agent: Agent;
const httpOutboundTransport = new HttpOutboundTransport();
const endpoint = "http://localhost:8080";
const reqEncryptedMessage: EncryptedMessage = {
  protected: "reqProtected",
  iv: "reqIv",
  ciphertext: "reqCiphertext",
  tag: "reqTag",
};

describe("HTTP outbound transport test", () => {
  beforeAll(async () => {
    agent = new Agent({
      config,
      dependencies: agentDependencies,
      modules: {
        ionicStorage: new IonicStorageModule(),
      },
    });

    await httpOutboundTransport.start(agent);
  });

  afterAll(async () => {
    await httpOutboundTransport.stop();
  });

  test("should emit the response if successfully sent and response received", async () => {
    const response = {
      protected: "respProtected",
      iv: "respIv",
      ciphertext: "respCiphertext",
      tag: "respTag",
    };
    const succeedFetchMock = jest.fn().mockResolvedValue({
      text: () => JsonEncoder.toString(response),
    });
    global.fetch = succeedFetchMock;

    const outboundPackage: OutboundPackage = {
      payload: reqEncryptedMessage,
      responseRequested: true,
      endpoint,
    };

    await httpOutboundTransport.sendMessage(outboundPackage);
    expect(succeedFetchMock).toBeCalledWith(endpoint, {
      body: JsonEncoder.toString(outboundPackage.payload),
      headers: { "Content-type": agent.config.didCommMimeType },
      method: "POST",
      signal: expect.any(AbortSignal),
    });
    expect(emitEventMock).toBeCalledWith(AgentEventTypes.AgentMessageReceived, {
      metadata: {
        contextCorrelationId: "default",
      },
      payload: {
        message: response,
      },
      type: AgentEventTypes.AgentMessageReceived,
    });
  });

  test("should not emit a response if it was not requested", async () => {
    const response = {
      protected: "respProtected",
      iv: "respIv",
      ciphertext: "respCiphertext",
      tag: "respTag",
    };
    const succeedFetchMock = jest.fn().mockResolvedValue({
      text: () => JsonEncoder.toString(response),
    });
    global.fetch = succeedFetchMock;

    const outboundPackage: OutboundPackage = {
      payload: reqEncryptedMessage,
      responseRequested: false,
      endpoint,
    };

    await httpOutboundTransport.sendMessage(outboundPackage);
    expect(succeedFetchMock).toBeCalledWith(endpoint, {
      body: JsonEncoder.toString(outboundPackage.payload),
      headers: { "Content-type": agent.config.didCommMimeType },
      method: "POST",
      signal: expect.any(AbortSignal),
    });
    expect(emitEventMock).not.toBeCalled();
  });

  test("cannot send an outbound message to no endpoint", async () => {
    const outboundPackage: OutboundPackage = {
      payload: reqEncryptedMessage,
      responseRequested: true,
    };

    await expect(
      httpOutboundTransport.sendMessage(outboundPackage)
    ).rejects.toThrowError(HttpOutboundTransport.MISSING_ENDPOINT);
    expect(emitEventMock).not.toBeCalled();
  });

  test("should throw for non timeout errors while sending", async () => {
    const outboundPackage: OutboundPackage = {
      payload: reqEncryptedMessage,
      responseRequested: true,
      endpoint,
    };
    const errorMsg = "Completely unknown...";
    const failFetchMock = jest.fn().mockImplementation(() => {
      throw new Error(errorMsg);
    });
    global.fetch = failFetchMock;

    await expect(
      httpOutboundTransport.sendMessage(outboundPackage)
    ).rejects.toThrowError(
      `${HttpOutboundTransport.UNEXPECTED_ERROR} ${endpoint}: ${errorMsg}`
    );
    expect(failFetchMock).toBeCalledWith(endpoint, {
      body: JsonEncoder.toString(outboundPackage.payload),
      headers: { "Content-type": agent.config.didCommMimeType },
      method: "POST",
      signal: expect.any(AbortSignal),
    });
    expect(emitEventMock).not.toBeCalled();
  });

  test("should not emit response if it is not of the valid format", async () => {
    const response = { bad: "response" };
    const succeedFetchMock = jest.fn().mockResolvedValue({
      text: () => JsonEncoder.toString(response),
    });
    global.fetch = succeedFetchMock;

    const outboundPackage: OutboundPackage = {
      payload: reqEncryptedMessage,
      responseRequested: true,
      endpoint,
    };

    await httpOutboundTransport.sendMessage(outboundPackage);
    expect(succeedFetchMock).toBeCalledWith(endpoint, {
      body: JsonEncoder.toString(outboundPackage.payload),
      headers: { "Content-type": agent.config.didCommMimeType },
      method: "POST",
      signal: expect.any(AbortSignal),
    });
    expect(emitEventMock).not.toBeCalled();
  });

  test("should not emit response if there is no response to emit", async () => {
    const succeedFetchMock = jest.fn().mockResolvedValue({
      text: () => undefined,
    });
    global.fetch = succeedFetchMock;

    const outboundPackage: OutboundPackage = {
      payload: reqEncryptedMessage,
      responseRequested: true,
      endpoint,
    };

    await httpOutboundTransport.sendMessage(outboundPackage);
    expect(succeedFetchMock).toBeCalledWith(endpoint, {
      body: JsonEncoder.toString(outboundPackage.payload),
      headers: { "Content-type": agent.config.didCommMimeType },
      method: "POST",
      signal: expect.any(AbortSignal),
    });
    expect(emitEventMock).not.toBeCalled();
  });

  test("should not emit or throw for a timeout", async () => {
    const outboundPackage: OutboundPackage = {
      payload: reqEncryptedMessage,
      responseRequested: true,
      endpoint,
    };
    const errorMsg = "Completely unknown...";
    const failFetchMock = jest.fn().mockImplementation(() => {
      throw new DOMException(errorMsg, "AbortError");
    });
    global.fetch = failFetchMock;

    await httpOutboundTransport.sendMessage(outboundPackage);
    expect(failFetchMock).toBeCalledWith(endpoint, {
      body: JsonEncoder.toString(outboundPackage.payload),
      headers: { "Content-type": agent.config.didCommMimeType },
      method: "POST",
      signal: expect.any(AbortSignal),
    });
    expect(emitEventMock).not.toBeCalled();
  });

  test("can only send a supported scheme", async () => {
    const outboundPackage: OutboundPackage = {
      payload: {
        protected: "reqProtected",
        iv: "reqIv",
        ciphertext: "reqCiphertext",
        tag: "reqTag",
      },
      responseRequested: true,
      endpoint: "ws://localhost:8080",
    };

    await expect(
      httpOutboundTransport.sendMessage({
        ...outboundPackage,
        endpoint: "ws://localhost:8080",
      })
    ).rejects.toThrowError(HttpOutboundTransport.UNSUPPORTED_ENDPOINT);
    await expect(
      httpOutboundTransport.sendMessage({ ...outboundPackage, endpoint: "xyz" })
    ).rejects.toThrowError(HttpOutboundTransport.UNSUPPORTED_ENDPOINT);
  });
});
