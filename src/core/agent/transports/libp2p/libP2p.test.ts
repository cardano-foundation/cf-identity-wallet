import { expect, test } from "@jest/globals";
import { Libp2p } from "@libp2p/interface";
import { PeerId } from "@libp2p/interface/peer-id";
import { IncomingStreamData } from "@libp2p/interface/src/stream-handler";
import { Connection, Stream } from "@libp2p/interface/src/connection";
import { Pushable } from "it-pushable";
import { OutboundPackage } from "@aries-framework/core";
import { EncryptedMessage } from "@aries-framework/core/build/types";
import { TextEncoder, TextDecoder } from "util";
import { LibP2p, LIBP2P_RELAY, schemaPrefix } from "./libP2p";
// eslint-disable-next-line no-undef
Object.assign(global, { TextDecoder, TextEncoder });
// Mock dependencies and methods
jest.mock("../libP2pInboundTransport", () => ({
  LibP2pInboundTransport: jest.fn(),
}));
jest.mock("./libP2p.service", () => ({
  LibP2pService: jest.fn(() => ({
    multiaddr: jest.fn(),
    pushable: jest.fn(() => ({
      push: jest.fn(),
    })),
    pipe: jest.fn(),
    mplex: jest.fn(),
    noise: jest.fn(),
    fromString: jest.fn(),
    toString: jest.fn(),
    createNode: jest.fn<Partial<Libp2p>, never>(() => ({
      peerId: peerId as any as PeerId,
      isStarted: jest.fn(() => false),
      handle: jest.fn(),
      addEventListener: jest.fn(),
      dial: jest.fn(() => ({
        newStream: jest.fn(),
      })) as any,
      stop: jest.fn(),
    })),
    advertising: jest.fn(() => endpoint),
    getNodeEndpoint: jest.fn(() => endpoint),
    timeOut: jest.fn(() => [Promise.resolve(), 0]),
    createFromJSON: jest.fn(),
    getPeerJson: jest.fn(() => peerIdJSON),
  })),
}));
const libP2p = LibP2p.libP2p;
const peerId = "12D3KooWBneTYQJQPYSh8pvkSuoctUjkeyoEjqeY7UEsbpc5rtm4";
const endpoint = `${schemaPrefix}${LIBP2P_RELAY}/p2p-circuit/webrtc/p2p/${peerId}`;
const peerIdJSON = {
  id: peerId,
  privKey: "privKey",
  pubKey: "pubKey",
};

describe("LibP2p webrtc class test", () => {
  beforeEach(async () => {
    await libP2p.initNode();
    await libP2p.start();
    libP2p.setEndpoint(undefined as any);
  });

  afterEach(async () => {
    libP2p.webRTCConnections.clear();
  });

  test("LibP2p get instance: should successfully get the instance ", async () => {
    expect(libP2p).toEqual(LibP2p.libP2p);
  });

  test("LibP2p should successfully get endpoint", async () => {
    const result = libP2p.getEndpoint(peerId);
    expect(result).toContain(endpoint);
  });

  test("LibP2p should successfully get peerId", async () => {
    expect(libP2p.peerId).toEqual(peerId);
  });

  test("LibP2p should successfully start with exist peer", async () => {
    libP2p.setNode(undefined as any);
    libP2p.isStart = false;
    const result = await libP2p.start(peerIdJSON);
    expect(result).toEqual(libP2p);
  });

  test("LibP2p should successfully start without init node", async () => {
    libP2p.setNode(undefined as any);
    const result = await libP2p.start();
    expect(result).toEqual(libP2p);
  });

  test("LibP2p should successfully start", async () => {
    const result = await libP2p.start();
    expect(result).toEqual(libP2p);
  });

  test("LibP2p should successfully start", async () => {
    await libP2p.initNode();
    const result = await libP2p.start();
    expect(result).toEqual(libP2p);
  });

  test("LibP2p should successfully getPeerJson", async () => {
    const result = libP2p.getPeerJson();
    expect(result).toEqual(peerIdJSON);
  });

  test("LibP2p should successfully getPeerJson", async () => {
    const mockEvent: Partial<CustomEvent<Partial<Connection>>> = {
      detail: {
        multiplexer: "/webrtc",
        remotePeer: {
          toString: jest.fn(() => peerId),
        } as never as PeerId,
      },
    };
    libP2p.webRTCConnections.set(peerId, {
      isActive: true,
      connection: {} as any as Connection,
      outgoingStream: {} as any as Stream,
      sender: {} as any as Pushable<Uint8Array, void, unknown>,
    });
    libP2p.updateConnectionTool(mockEvent as any as CustomEvent<Connection>);
    expect(libP2p.webRTCConnections.get(peerId)?.isActive).toEqual(false);
  });

  test("LibP2p advertising should throw error when node not start", async () => {
    libP2p.setNode(undefined as any);
    await expect(libP2p.advertising()).rejects.toThrowError();
  });

  test("LibP2p successfully advertising when endpoint has been set", async () => {
    libP2p.setEndpoint(endpoint);
    const result = await libP2p.advertising();
    expect(result).toEqual(libP2p.getEndpoint(peerId));
  });

  test("LibP2p successfully advertising", async () => {
    const result = await libP2p.advertising();
    expect(result).toEqual(libP2p.getEndpoint(peerId));
    expect(libP2p.endpoint).toEqual(endpoint);
  });

  test("LibP2p fail advertising when can not get endpoint from node", async () => {
    const advertisingMockFn = jest.spyOn(libP2p.libP2pService, "advertising");
    advertisingMockFn.mockReturnValue(undefined as any);
    await expect(libP2p.advertising()).rejects.toThrowError(
      LibP2p.CAN_NOT_ADS_ERROR_MSG
    );
  });

  test("LibP2p fail advertising when timeout", async () => {
    const advertisingMockFn = jest.spyOn(libP2p.libP2pService, "advertising");
    advertisingMockFn.mockReturnValue(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(endpoint);
        }, 1.5 * 1000);
      })
    );
    const timeoutMockFn = jest.spyOn(libP2p.libP2pService, "timeOut");
    timeoutMockFn.mockReturnValue([
      new Promise<void>((_, reject) => {
        setTimeout(
          () => {
            reject(new Error(LibP2p.ADS_TIMEOUT_ERROR_MSG));
          },
          0.5 * 1000,
          LibP2p.ADS_TIMEOUT_ERROR_MSG
        );
      }),
      1000,
    ]);
    await expect(libP2p.advertising()).rejects.toThrowError(
      LibP2p.ADS_TIMEOUT_ERROR_MSG
    );
  });

  test("LibP2p successfully receive message", async () => {
    const mockStream = {} as Stream;
    const mockData: IncomingStreamData = {
      connection: {} as Connection,
      stream: mockStream,
    };
    await expect(libP2p.receiveMessage(mockData)).resolves.toBeUndefined();
  });

  test("LibP2p successfully pipeMessage", async () => {
    const mockPushable: Pushable<Uint8Array, void, unknown> =
      {} as unknown as Pushable<Uint8Array, void, unknown>;
    const mockStream: Stream = {} as unknown as Stream;
    await expect(
      libP2p.pipeMessage(mockPushable, mockStream)
    ).resolves.toBeUndefined();
  });

  test("LibP2p fail when sendMessage without init node", async () => {
    const payload: EncryptedMessage = {} as EncryptedMessage;
    const outboundPackage: OutboundPackage = {
      connectionId: "",
      endpoint: "",
      payload: payload,
      responseRequested: false,
    };
    libP2p.setNode(undefined as any);
    await expect(libP2p.sendMessage(outboundPackage)).rejects.toThrowError(
      LibP2p.NOT_INIT_NODE_ERROR_MSG
    );
  });

  test("LibP2p successfully setUsageStatusOfInbound", async () => {
    libP2p.setUsageStatusOfInbound(true);
    expect(libP2p.usageStatus.usageStatusOfInbound).toEqual(true);
  });

  test("LibP2p successfully setUsageStatusOfInbound", async () => {
    libP2p.setUsageStatusOfOutbound(true);
    expect(libP2p.usageStatus.usageStatusOfInbound).toEqual(true);
  });

  test("LibP2p successfully stop", async () => {
    libP2p.setUsageStatusOfInbound(false);
    libP2p.setUsageStatusOfOutbound(false);
    await libP2p.stop();
    expect(libP2p.isStart).toEqual(false);
  });

  test("LibP2p successfully stop", async () => {
    await expect(libP2p.handleInboundMessage()).toBeUndefined;
  });

  test("LibP2p fail when sendMessage without set peerId", async () => {
    const payload: EncryptedMessage = {} as EncryptedMessage;
    const outboundPackage: OutboundPackage = {
      connectionId: "",
      endpoint: "",
      payload: payload,
      responseRequested: false,
    };
    libP2p.setPeerId(undefined as any);
    await expect(libP2p.sendMessage(outboundPackage)).rejects.toThrowError(
      LibP2p.NOT_FOUND_PEER_ID_ERROR_MSG
    );
  });

  test("LibP2p fail when sendMessage payload without endpoint", async () => {
    const payload: EncryptedMessage = {} as EncryptedMessage;
    const outboundPackage: OutboundPackage = {
      connectionId: "",
      payload: payload,
      responseRequested: false,
    };
    await expect(libP2p.sendMessage(outboundPackage)).rejects.toThrowError(
      LibP2p.ENDPOINT_IS_NOT_DEFINED_ERROR_MSG
    );
  });

  test("LibP2p fail when sendMessage payload without peerId", async () => {
    const payload: EncryptedMessage = {} as EncryptedMessage;
    const outboundPackage: OutboundPackage = {
      connectionId: "",
      payload: payload,
      responseRequested: false,
      endpoint: "libp2p:/",
    };
    await expect(libP2p.sendMessage(outboundPackage)).rejects.toThrowError(
      LibP2p.NOT_FOUND_PEER_ID_ERROR_MSG
    );
  });

  test("LibP2p successfully when sendMessage with inactive connection", async () => {
    libP2p.webRTCConnections.set(
      "12D3KooWP2mYvnf3S2E77PRUMWTXbkKXmyJpkGQhTHGGnHzJ1pUC",
      {
        isActive: false,
        connection: {
          close: jest.fn(),
        } as any as Connection,
        outgoingStream: {
          close: jest.fn(),
        } as any as Stream,
        sender: {} as any as Pushable<Uint8Array, void, unknown>,
      }
    );
    const payload: EncryptedMessage = {
      protected: "reqProtected",
      iv: "reqIv",
      ciphertext: "reqCiphertext",
      tag: "reqTag",
    };
    const outboundPackage: OutboundPackage = {
      connectionId: "1",
      endpoint:
        "libp2p://dns/libp2p-relay-9aff91ec2cbd.herokuapp.com/tcp/443/wss/p2p/QmUDSANiD1VyciqTgUBTw9egXHAtmamrtR1sa8SNf4aPHa/p2p-circuit/webrtc/p2p/12D3KooWP2mYvnf3S2E77PRUMWTXbkKXmyJpkGQhTHGGnHzJ1pUC",
      payload: payload,
      responseRequested: false,
    };
    const pipeMessageMockFn = jest.spyOn(libP2p, "pipeMessage");
    pipeMessageMockFn.mockResolvedValue(undefined as any);
    await expect(libP2p.sendMessage(outboundPackage)).resolves.toBeUndefined();
  });

  test("LibP2p successfully when sendMessage without exits connection", async () => {
    const payload: EncryptedMessage = {
      protected: "reqProtected",
      iv: "reqIv",
      ciphertext: "reqCiphertext",
      tag: "reqTag",
    };
    const outboundPackage: OutboundPackage = {
      connectionId: "1",
      endpoint:
        "libp2p://dns/libp2p-relay-9aff91ec2cbd.herokuapp.com/tcp/443/wss/p2p/QmUDSANiD1VyciqTgUBTw9egXHAtmamrtR1sa8SNf4aPHa/p2p-circuit/webrtc/p2p/12D3KooWP2mYvnf3S2E77PRUMWTXbkKXmyJpkGQhTHGGnHzJ1pUC",
      payload: payload,
      responseRequested: false,
    };
    const pipeMessageMockFn = jest.spyOn(libP2p, "pipeMessage");
    pipeMessageMockFn.mockResolvedValue(undefined as any);
    await expect(libP2p.sendMessage(outboundPackage)).resolves.toBeUndefined();
  });
});
