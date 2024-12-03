import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { Agent } from "../../../core/agent/agent";
import {
  ConnectionShortDetails,
  ConnectionStatus,
} from "../../../core/agent/agent.types";
import {
  AcdcStateChangedEvent,
  ConnectionStateChangedEvent,
  EventTypes,
} from "../../../core/agent/event.types";
import { OperationPendingRecordType } from "../../../core/agent/records/operationPendingRecord.type";
import {
  CredentialShortDetails,
  CredentialStatus,
} from "../../../core/agent/services/credentialService.types";
import {
  PeerConnectSigningEvent,
  PeerConnectedEvent,
  PeerConnectionBrokenEvent,
  PeerConnectionEventTypes,
  PeerDisconnectedEvent,
} from "../../../core/cardano/walletConnect/peerConnection.types";
import { store } from "../../../store";
import { updateOrAddConnectionCache } from "../../../store/reducers/connectionsCache";
import { updateOrAddCredsCache } from "../../../store/reducers/credsCache";
import { updateIsPending } from "../../../store/reducers/identifiersCache";
import { setNotificationsCache } from "../../../store/reducers/notificationsCache";
import {
  setQueueIncomingRequest,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { IncomingRequestType } from "../../../store/reducers/stateCache/stateCache.types";
import {
  ConnectionData,
  setConnectedWallet,
  setWalletConnectionsCache,
} from "../../../store/reducers/walletConnectionsCache";
import { ToastMsgType } from "../../globals/types";
import {
  AppWrapper,
  acdcChangeHandler,
  connectionStateChangedHandler,
  peerConnectRequestSignChangeHandler,
  peerConnectedChangeHandler,
  peerConnectionBrokenChangeHandler,
  peerDisconnectedChangeHandler,
} from "./AppWrapper";
import { signifyOperationStateChangeHandler } from "./coreEventListeners";

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      start: jest.fn(),
      setupLocalDependencies: jest.fn(),
      auth: {
        getLoginAttempts: jest.fn(() =>
          Promise.resolve({
            attempts: 0,
            lockedUntil: Date.now(),
          })
        ),
      },
      identifiers: {
        getIdentifiers: jest.fn().mockResolvedValue([]),
        syncKeriaIdentifiers: jest.fn(),
      },
      multiSigs: {
        getMultisigIcpDetails: jest.fn().mockResolvedValue({}),
      },
      connections: {
        getConnections: jest.fn().mockResolvedValue([]),
        getMultisigConnections: jest.fn().mockResolvedValue([]),
        onConnectionStateChanged: jest.fn(),
        getConnectionShortDetails: jest.fn(),
        isConnectionRequestSent: jest.fn(),
        isConnectionResponseReceived: jest.fn(),
        isConnectionRequestReceived: jest.fn(),
        isConnectionResponseSent: jest.fn(),
        isConnectionConnected: jest.fn(),
        getConnectionShortDetailById: jest.fn(),
        getUnhandledConnections: jest.fn(),
        syncKeriaContacts: jest.fn(),
      },
      credentials: {
        getCredentials: jest.fn().mockResolvedValue([]),
        onCredentialStateChanged: jest.fn(),
        isCredentialOfferReceived: jest.fn(),
        isCredentialRequestSent: jest.fn(),
        createMetadata: jest.fn(),
        isCredentialDone: jest.fn(),
        updateMetadataCompleted: jest.fn(),
        onAcdcStateChanged: jest.fn(),
        syncACDCs: jest.fn(),
      },
      messages: {
        onBasicMessageStateChanged: jest.fn(),
        pickupMessagesFromMediator: jest.fn(),
      },
      keriaNotifications: {
        pollNotifications: jest.fn(),
        pollLongOperations: jest.fn(),
        getAllNotifications: jest.fn(),
        onNewNotification: jest.fn(),
        onLongOperationComplete: jest.fn(),
        onRemoveNotification: jest.fn(),
        stopNotification: jest.fn()
      },
      getKeriaOnlineStatus: jest.fn(),
      onKeriaStatusStateChanged: jest.fn(),
      peerConnectionMetadataStorage: {
        getAllPeerConnectionMetadata: jest.fn(),
        getPeerConnectionMetadata: jest.fn(),
        getPeerConnection: jest.fn(),
      },
      basicStorage: {
        findById: jest.fn(),
        save: jest.fn(),
      },
    },
  },
}));

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    set: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
  },
}));

describe("App Wrapper", () => {
  test("renders children components", async () => {
    const { getByText } = render(
      <Provider store={store}>
        <AppWrapper>
          <div>App Content</div>
        </AppWrapper>
      </Provider>
    );

    await waitFor(() => {
      expect(getByText("App Content")).toBeInTheDocument();
    });
  });
});

const connectionStateChangedEventMock = {
  type: EventTypes.ConnectionStateChanged,
  payload: {
    status: ConnectionStatus.PENDING,
  },
} as ConnectionStateChangedEvent;

const connectionShortDetailsMock = {
  id: "id",
  label: "idw",
  logo: "png",
} as ConnectionShortDetails;

const peerConnectedEventMock = {
  type: PeerConnectionEventTypes.PeerConnected,
  payload: {
    identifier: "identifier",
    dAppAddress: "dApp-address",
  },
} as PeerConnectedEvent;

const peerDisconnectedEventMock = {
  type: PeerConnectionEventTypes.PeerDisconnected,
  payload: {
    identifier: "identifier",
    dAppAddress: "dApp-address",
  },
} as PeerDisconnectedEvent;

const peerSignRequestEventMock = {
  type: PeerConnectionEventTypes.PeerConnectSign,
  payload: {
    identifier: "identifier",
    approvalCallback: function () {
      return;
    },
    payload: "Hello",
  },
} as PeerConnectSigningEvent;

const peerConnectionBrokenEventMock = {
  type: PeerConnectionEventTypes.PeerConnectionBroken,
  payload: {},
} as PeerConnectionBrokenEvent;

const peerConnectionMock: ConnectionData = {
  id: "dApp-address",
  name: "dApp-name",
  iconB64: "icon",
  selectedAid: "identifier",
  url: "http://localhost:3000",
};
const dispatch = jest.fn();
describe("AppWrapper handler", () => {
  describe("Connection state changed handler", () => {
    beforeAll(() => {
      const getConnectionShortDetailsSpy = jest.spyOn(
        Agent.agent.connections,
        "getConnectionShortDetailById"
      );
      getConnectionShortDetailsSpy.mockResolvedValue(
        connectionShortDetailsMock
      );
    });

    test("handles connection state pending", async () => {
      await connectionStateChangedHandler(
        connectionStateChangedEventMock,
        dispatch
      );
      expect(dispatch).toBeCalledWith(
        setToastMsg(ToastMsgType.CONNECTION_REQUEST_PENDING)
      );
    });

    test("handles connection state succuss", async () => {
      const connectionStateChangedEventMockSuccess = {
        ...connectionStateChangedEventMock,
        payload: {
          status: ConnectionStatus.CONFIRMED,
          connectionId: "connectionId",
        },
      };
      await connectionStateChangedHandler(
        connectionStateChangedEventMockSuccess,
        dispatch
      );
      expect(dispatch).toBeCalledWith(
        updateOrAddConnectionCache(connectionShortDetailsMock)
      );
      expect(dispatch).toBeCalledWith(
        setToastMsg(ToastMsgType.NEW_CONNECTION_ADDED)
      );
    });
  });

  describe("Credential state changed handler", () => {
    test("handles credential state pending", async () => {
      const credentialMock = {} as CredentialShortDetails;
      const credentialStateChangedEventMock = {
        type: EventTypes.AcdcStateChanged,
        payload: {
          status: CredentialStatus.PENDING,
          credential: credentialMock,
        },
      } as AcdcStateChangedEvent;
      await acdcChangeHandler(credentialStateChangedEventMock, dispatch);
      expect(dispatch).toBeCalledWith(
        setToastMsg(ToastMsgType.CREDENTIAL_REQUEST_PENDING)
      );
    });

    test("handles credential state confirmed", async () => {
      const credentialMock = {} as CredentialShortDetails;
      const credentialStateChangedEventMock = {
        type: EventTypes.AcdcStateChanged,
        payload: {
          status: CredentialStatus.CONFIRMED,
          credential: credentialMock,
        },
      } as AcdcStateChangedEvent;
      await acdcChangeHandler(credentialStateChangedEventMock, dispatch);
      expect(dispatch).toBeCalledWith(updateOrAddCredsCache(credentialMock));
      expect(dispatch).toBeCalledWith(
        setToastMsg(ToastMsgType.NEW_CREDENTIAL_ADDED)
      );
    });

    test("handles credential state revoked", async () => {
      const credentialMock = {} as CredentialShortDetails;
      const credentialStateChangedEventMock = {
        type: EventTypes.AcdcStateChanged,
        payload: {
          status: CredentialStatus.REVOKED,
          credential: credentialMock,
        },
      } as AcdcStateChangedEvent;
      await acdcChangeHandler(credentialStateChangedEventMock, dispatch);
      expect(dispatch).toBeCalledWith(updateOrAddCredsCache(credentialMock));
    });
  });

  describe("Peer connection states changed handler", () => {
    test("handle peer connected event", async () => {
      Agent.agent.peerConnectionMetadataStorage.getPeerConnectionMetadata = jest
        .fn()
        .mockResolvedValue(peerConnectionMock);
      Agent.agent.peerConnectionMetadataStorage.getAllPeerConnectionMetadata =
        jest.fn().mockResolvedValue([peerConnectionMock]);
      await peerConnectedChangeHandler(peerConnectedEventMock, dispatch);
      await waitFor(() => {
        expect(dispatch).toBeCalledWith(setConnectedWallet(peerConnectionMock));
      });
      expect(dispatch).toBeCalledWith(
        setWalletConnectionsCache([peerConnectionMock])
      );
      expect(dispatch).toBeCalledWith(
        setToastMsg(ToastMsgType.CONNECT_WALLET_SUCCESS)
      );
    });

    test("handle peer disconnected event", async () => {
      await peerDisconnectedChangeHandler(
        peerDisconnectedEventMock,
        peerConnectionMock.id,
        dispatch
      );
      expect(dispatch).toBeCalledWith(setConnectedWallet(null));
      expect(dispatch).toBeCalledWith(
        setToastMsg(ToastMsgType.DISCONNECT_WALLET_SUCCESS)
      );
    });

    test("handle peer sign request event", async () => {
      Agent.agent.peerConnectionMetadataStorage.getPeerConnection = jest
        .fn()
        .mockResolvedValue(peerConnectionMock);
      await peerConnectRequestSignChangeHandler(
        peerSignRequestEventMock,
        dispatch
      );
      expect(dispatch).toBeCalledWith(
        setQueueIncomingRequest({
          signTransaction: peerSignRequestEventMock,
          peerConnection: peerConnectionMock,
          type: IncomingRequestType.PEER_CONNECT_SIGN,
        })
      );
    });

    test("handle peer connection broken event", async () => {
      await peerConnectionBrokenChangeHandler(
        peerConnectionBrokenEventMock,
        dispatch
      );
      expect(dispatch).toBeCalledWith(setConnectedWallet(null));
      expect(dispatch).toBeCalledWith(
        setToastMsg(ToastMsgType.DISCONNECT_WALLET_SUCCESS)
      );
    });
  });
});

describe("Signify operation state changed handler", () => {
  test("handles completed witness operation", async () => {
    const id = "id";
    await signifyOperationStateChangeHandler(
      { opType: OperationPendingRecordType.Witness, oid: id },
      dispatch
    );
    expect(dispatch).toBeCalledWith(
      updateIsPending({ id: id, isPending: false })
    );
    expect(dispatch).toBeCalledWith(
      setToastMsg(ToastMsgType.IDENTIFIER_UPDATED)
    );
  });

  test("handles completed group operation", async () => {
    const id = "id";
    await signifyOperationStateChangeHandler(
      { opType: OperationPendingRecordType.Group, oid: id },
      dispatch
    );
    expect(dispatch).toBeCalledWith(
      updateIsPending({ id: id, isPending: false })
    );
    expect(dispatch).toBeCalledWith(
      setToastMsg(ToastMsgType.IDENTIFIER_UPDATED)
    );
  });
});
