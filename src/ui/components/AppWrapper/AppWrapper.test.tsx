import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import {
  AppWrapper,
  acdcChangeHandler,
  connectionStateChangedHandler,
  keriaNotificationsChangeHandler,
  peerConnectRequestSignChangeHandler,
  peerConnectedChangeHandler,
  peerDisconnectedChangeHandler,
} from "./AppWrapper";
import { store } from "../../../store";
import { Agent } from "../../../core/agent/agent";
import { updateOrAddConnectionCache } from "../../../store/reducers/connectionsCache";
import {
  setCurrentOperation,
  setQueueIncomingRequest,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { OperationType, ToastMsgType } from "../../globals/types";
import {
  AcdcEventTypes,
  AcdcStateChangedEvent,
  ConnectionEventTypes,
  ConnectionShortDetails,
  ConnectionStateChangedEvent,
  ConnectionStatus,
  KeriaNotification,
  NotificationRoute,
} from "../../../core/agent/agent.types";
import { IncomingRequestType } from "../../../store/reducers/stateCache/stateCache.types";
import { updateOrAddCredsCache } from "../../../store/reducers/credsCache";
import {
  CredentialShortDetails,
  CredentialStatus,
} from "../../../core/agent/services/credentialService.types";
import {
  PeerConnectSigningEvent,
  PeerConnectedEvent,
  PeerConnectionEventTypes,
  PeerDisconnectedEvent,
} from "../../../core/cardano/walletConnect/peerConnection.types";
import {
  ConnectionData,
  setConnectedWallet,
  setWalletConnectionsCache,
} from "../../../store/reducers/walletConnectionsCache";

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      start: jest.fn(),
      identifiers: {
        getIdentifiers: jest.fn().mockResolvedValue([]),
        syncKeriaIdentifiers: jest.fn(),
      },
      multiSigs: {
        getUnhandledMultisigIdentifiers: jest.fn(),
        getMultisigIcpDetails: jest.fn().mockResolvedValue({}),
      },
      connections: {
        getConnections: jest.fn().mockResolvedValue([]),
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
        getUnhandledIpexGrantNotifications: jest.fn(),
        onAcdcStateChanged: jest.fn(),
        syncACDCs: jest.fn(),
      },
      messages: {
        onBasicMessageStateChanged: jest.fn(),
        pickupMessagesFromMediator: jest.fn(),
      },
      signifyNotifications: {
        onNotificationStateChanged: jest.fn(),
      },
      getKeriaOnlineStatus: jest.fn(),
      onKeriaStatusStateChanged: jest.fn(),
      peerConnectionMetadataStorage: {
        getAllPeerConnectionMetadata: jest.fn(),
        getPeerConnectionMetadata: jest.fn(),
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
  type: ConnectionEventTypes.ConnectionStateChanged,
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
        setCurrentOperation(OperationType.RECEIVE_CONNECTION)
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
      const credentialStateChangedEventMock = {
        type: AcdcEventTypes.AcdcStateChanged,
        payload: {
          status: CredentialStatus.PENDING,
          credentialId: "credentialId",
        },
      } as AcdcStateChangedEvent;
      await acdcChangeHandler(credentialStateChangedEventMock, dispatch);
      expect(dispatch).toBeCalledWith(
        setCurrentOperation(OperationType.ADD_CREDENTIAL)
      );
      expect(dispatch).toBeCalledWith(
        setToastMsg(ToastMsgType.CREDENTIAL_REQUEST_PENDING)
      );
    });

    test("handles credential state pending", async () => {
      const credentialMock = {} as CredentialShortDetails;
      const credentialStateChangedEventMock = {
        type: AcdcEventTypes.AcdcStateChanged,
        payload: {
          status: CredentialStatus.CONFIRMED,
          credential: credentialMock,
        },
      } as AcdcStateChangedEvent;
      await acdcChangeHandler(credentialStateChangedEventMock, dispatch);
      expect(dispatch).toBeCalledWith(updateOrAddCredsCache(credentialMock));
      expect(dispatch).toBeCalledWith(setCurrentOperation(OperationType.IDLE));
      expect(dispatch).toBeCalledWith(
        setToastMsg(ToastMsgType.NEW_CREDENTIAL_ADDED)
      );
    });
  });

  describe("Keria notification state changed handler", () => {
    test("handles credential notification", async () => {
      const keriNoti = {
        id: "id",
        a: {
          r: NotificationRoute.ExnIpexGrant,
        },
        createdAt: new Date(),
      } as KeriaNotification;
      await keriaNotificationsChangeHandler(keriNoti, dispatch);
      expect(dispatch).toBeCalledWith(
        setQueueIncomingRequest({
          id: keriNoti.id,
          type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
          logo: "", // TODO: must define Keri logo
          label: "Credential Issuance Server", // TODO: must define it
        })
      );
    });

    test("handles multisig notification", async () => {
      const keriNoti = {
        id: "id",
        a: {
          r: NotificationRoute.MultiSigIcp,
        },
        createdAt: new Date(),
      } as KeriaNotification;
      await keriaNotificationsChangeHandler(keriNoti, dispatch);
      expect(dispatch).toBeCalledWith(
        setQueueIncomingRequest({
          id: keriNoti?.id,
          event: keriNoti,
          type: IncomingRequestType.MULTI_SIG_REQUEST_INCOMING,
          multisigIcpDetails: {} as any,
        })
      );
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
      expect(dispatch).toBeCalledWith(
        setConnectedWallet(peerConnectionMock.id)
      );
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
      Agent.agent.peerConnectionMetadataStorage.getPeerConnectionMetadata = jest
        .fn()
        .mockResolvedValue(peerConnectionMock);
      await peerConnectRequestSignChangeHandler(
        peerSignRequestEventMock,
        dispatch
      );
      expect(dispatch).toBeCalledWith(
        setQueueIncomingRequest({
          id: "peer-connect-signing",
          signTransaction: peerSignRequestEventMock,
          peerConnection: peerConnectionMock,
          type: IncomingRequestType.PEER_CONNECT_SIGN,
        })
      );
    });
  });
});
