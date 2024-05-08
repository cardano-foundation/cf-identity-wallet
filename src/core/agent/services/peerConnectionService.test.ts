import { PeerConnectionMetadataRecord } from "../records/peerConnectionMetadataRecord";
import { EventService } from "./eventService";
import { PeerConnectionService } from "./peerConnectionService";

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

const signifyClient = jest.mocked({
  connect: jest.fn(),
  boot: jest.fn(),
  identifiers: () => ({
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    addEndRole: jest.fn(),
    interact: jest.fn(),
    rotate: jest.fn(),
    members: jest.fn(),
  }),
  operations: () => ({
    get: jest.fn().mockImplementation((id: string) => {
      return {
        done: true,
        response: {
          i: id,
        },
      };
    }),
  }),
  oobis: () => ({
    get: jest.fn(),
    resolve: jest.fn().mockImplementation((name: string) => {
      return {
        done: true,
        response: {
          i: name,
        },
      };
    }),
  }),
  contacts: () => ({
    list: jest.fn(),
    get: jest.fn().mockImplementation((id: string) => {
      return {
        alias: "e57ee6c2-2efb-4158-878e-ce36639c761f",
        oobi: "oobi",
        id,
      };
    }),
    delete: jest.fn(),
  }),
  notifications: () => ({
    list: jest.fn(),
    mark: jest.fn(),
  }),
  ipex: () => ({
    admit: jest.fn(),
    submitAdmit: jest.fn(),
  }),
  credentials: () => ({
    list: jest.fn(),
  }),
  exchanges: () => ({
    get: jest.fn(),
    send: jest.fn(),
  }),
  agent: {
    pre: "pre",
  },
  keyStates: () => ({
    query: jest.fn(),
    get: jest.fn(),
  }),
});
const peerConnectionStorage = jest.mocked({
  getPeerConnectionMetadata: jest.fn(),
  getAllPeerConnectionMetadata: jest.fn(),
  updatePeerConnectionMetadata: jest.fn(),
  createPeerConnectionMetadataRecord: jest.fn(),
  deletePeerConnectionMetadataRecord: jest.fn(),
});

const agentServicesProps = {
  basicStorage: basicStorage as any,
  signifyClient: signifyClient as any,
  eventService: new EventService(),
  identifierStorage: {} as any,
  credentialStorage: {} as any,
  peerConnectionStorage: peerConnectionStorage as any,
};

const peerConnectionService = new PeerConnectionService(agentServicesProps);

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        getConnectionShortDetailById: jest.fn(),
        getConnections: jest.fn(),
      },
    },
  },
}));

const now = new Date();
const nowISO = now.toISOString();

const peerConnectionMetadataRecordProps = {
  id: "id",
  name: "name",
  url: "url",
  iconB64: "icon",
  selectedAid: "aid",
  createdAt: new Date(),
};

const peerConnectionMetadataRecord = new PeerConnectionMetadataRecord(
  peerConnectionMetadataRecordProps
);

describe("Peer connection service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  test("can get all peer connections", async () => {
    peerConnectionStorage.getAllPeerConnectionMetadata = jest
      .fn()
      .mockResolvedValue([peerConnectionMetadataRecord]);
    expect(await peerConnectionService.getPeerConnections()).toStrictEqual([
      peerConnectionMetadataRecord,
    ]);
  });

  test("can get all peer connections without error if there are none", async () => {
    peerConnectionStorage.getAllPeerConnectionMetadata = jest
      .fn()
      .mockResolvedValue([]);
    expect(await peerConnectionService.getPeerConnections()).toStrictEqual([]);
  });

  test("can get a peer connection", async () => {
    peerConnectionStorage.getPeerConnectionMetadata = jest
      .fn()
      .mockResolvedValue(peerConnectionMetadataRecord);
    expect(
      await peerConnectionService.getPeerConnection(
        peerConnectionMetadataRecord.id
      )
    ).toStrictEqual(peerConnectionMetadataRecord);
  });

  test("can create a peer connection", async () => {
    const newPeerConnectionProps = {
      id: "id1",
      name: "name1",
      url: "url1",
      iconB64: "icon1",
      selectedAid: "aid1",
      createdAt: new Date(),
    };
    peerConnectionStorage.getPeerConnectionMetadata = jest
      .fn()
      .mockResolvedValue(newPeerConnectionProps);
    expect(
      await peerConnectionService.createPeerConnection(newPeerConnectionProps)
    ).toEqual(newPeerConnectionProps);
    expect(
      peerConnectionStorage.createPeerConnectionMetadataRecord
    ).toBeCalledTimes(1);
  });

  test("Should call storage delete when delete a peer connection", async () => {
    await peerConnectionService.deletePeerConnection(
      peerConnectionMetadataRecord.id
    );
    expect(
      peerConnectionStorage.deletePeerConnectionMetadataRecord
    ).toBeCalledTimes(1);
  });

  test("Should call storage update when update a peer connection", async () => {
    await peerConnectionService.updatePeerConnection(
      peerConnectionMetadataRecord.id,
      { ...peerConnectionMetadataRecord, name: "update name" }
    );
    expect(peerConnectionStorage.updatePeerConnectionMetadata).toBeCalledTimes(
      1
    );
  });
});
