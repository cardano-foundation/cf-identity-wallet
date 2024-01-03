import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import {
  ConnectionStateChangedEvent,
  CredentialStateChangedEvent,
} from "@aries-framework/core";
import {
  AppWrapper,
  connectionStateChangedHandler,
  credentialStateChangedHandler,
} from "./AppWrapper";
import { store } from "../../../store";
import { AriesAgent } from "../../../core/agent/agent";
import { updateOrAddConnectionCache } from "../../../store/reducers/connectionsCache";
import {
  setQueueIncomingRequest,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";
import {
  ConnectionShortDetails,
  ConnectionType,
} from "../../../core/agent/agent.types";
import { IncomingRequestType } from "../../../store/reducers/stateCache/stateCache.types";
import { updateOrAddCredsCache } from "../../../store/reducers/credsCache";
import { CredentialMetadataRecordStatus } from "../../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";
import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";

jest.mock("../../../core/agent/agent", () => ({
  AriesAgent: {
    agent: {
      start: jest.fn(),
      identifiers: {
        getIdentifiers: jest.fn().mockResolvedValue([]),
        syncKeriaIdentifiers: jest.fn(),
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
        onConnectionKeriStateChanged: jest.fn(),
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
        getUnhandledCredentials: jest.fn(),
        onNotificationKeriStateChanged: jest.fn(),
        onAcdcKeriStateChanged: jest.fn(),
        syncACDCs: jest.fn(),
      },
      messages: {
        onBasicMessageStateChanged: jest.fn(),
        pickupMessagesFromMediator: jest.fn(),
      },
    },
  },
}));
jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    set: jest.fn(),
    get: jest.fn(),
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
  payload: {
    connectionRecord: { id: "id", imageUrl: "png", theirLabel: "idw" },
  },
} as ConnectionStateChangedEvent;
const connectionShortDetailsMock = {
  id: "id",
  label: "idw",
  logo: "png",
} as ConnectionShortDetails;

const dispatch = jest.fn();
describe("Connection state changed handler", () => {
  beforeAll(() => {
    const getConnectionShortDetailsSpy = jest.spyOn(
      AriesAgent.agent.connections,
      "getConnectionShortDetails"
    );
    getConnectionShortDetailsSpy.mockReturnValue(connectionShortDetailsMock);
  });

  test("handles connection state request sent", async () => {
    const isConnectionRequestSentSpy = jest.spyOn(
      AriesAgent.agent.connections,
      "isConnectionRequestSent"
    );
    isConnectionRequestSentSpy.mockImplementationOnce(() => true);
    await connectionStateChangedHandler(
      connectionStateChangedEventMock,
      dispatch
    );
    expect(dispatch).toBeCalledWith(
      updateOrAddConnectionCache(connectionShortDetailsMock)
    );
    expect(dispatch).toBeCalledWith(
      setToastMsg(ToastMsgType.CONNECTION_REQUEST_PENDING)
    );
  });

  test("handles connection state response received", async () => {
    const isConnectionResponseReceivedSpy = jest.spyOn(
      AriesAgent.agent.connections,
      "isConnectionResponseReceived"
    );
    isConnectionResponseReceivedSpy.mockImplementationOnce(() => true);
    await connectionStateChangedHandler(
      connectionStateChangedEventMock,
      dispatch
    );
    expect(dispatch).toBeCalledWith(
      setQueueIncomingRequest({
        id: "id",
        type: IncomingRequestType.CONNECTION_RESPONSE,
        logo: "png",
        label: "idw",
      })
    );
  });

  test("handles connection state request received", async () => {
    const isConnectionRequestReceivedSpy = jest.spyOn(
      AriesAgent.agent.connections,
      "isConnectionRequestReceived"
    );
    isConnectionRequestReceivedSpy.mockImplementationOnce(() => true);
    await connectionStateChangedHandler(
      connectionStateChangedEventMock,
      dispatch
    );
    expect(dispatch).toBeCalledWith(
      updateOrAddConnectionCache(connectionShortDetailsMock)
    );
    expect(dispatch).toBeCalledWith(
      setToastMsg(ToastMsgType.CONNECTION_REQUEST_INCOMING)
    );
    expect(dispatch).toBeCalledWith(
      setQueueIncomingRequest({
        id: "id",
        type: IncomingRequestType.CONNECTION_INCOMING,
        logo: "png",
        label: "idw",
      })
    );
  });

  test("handles connection state request sent", async () => {
    const isConnectionResponseSentSpy = jest.spyOn(
      AriesAgent.agent.connections,
      "isConnectionResponseSent"
    );
    isConnectionResponseSentSpy.mockImplementationOnce(() => true);
    await connectionStateChangedHandler(
      connectionStateChangedEventMock,
      dispatch
    );
    expect(dispatch).toBeCalledWith(
      setToastMsg(ToastMsgType.CONNECTION_REQUEST_PENDING)
    );
  });

  test("handles connection state connected", async () => {
    const isConnectionResponseSentSpy = jest.spyOn(
      AriesAgent.agent.connections,
      "isConnectionConnected"
    );
    isConnectionResponseSentSpy.mockImplementationOnce(() => true);
    await connectionStateChangedHandler(
      connectionStateChangedEventMock,
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

jest.mock("../../utils/colorGenerator", () => ({
  ColorGenerator: jest.fn(() => ({
    generateNextColor: jest.fn().mockReturnValue(["#000000", "#000000"]),
  })),
}));
const now = new Date();
const credentialStateChangedEventMock = {
  payload: {
    credentialRecord: { id: "id", createdAt: now, connectionId: "cid2" },
  },
} as CredentialStateChangedEvent;
describe("Credential state changed handler", () => {
  test("handles credential state offer received", async () => {
    const isCredentialOfferReceivedSpy = jest.spyOn(
      AriesAgent.agent.credentials,
      "isCredentialOfferReceived"
    );
    isCredentialOfferReceivedSpy.mockImplementationOnce(() => true);
    jest
      .spyOn(AriesAgent.agent.connections, "getConnectionShortDetailById")
      .mockResolvedValue(connectionShortDetailsMock);
    await credentialStateChangedHandler(
      credentialStateChangedEventMock,
      dispatch
    );
    expect(dispatch).toBeCalledWith(
      setQueueIncomingRequest({
        id: credentialStateChangedEventMock.payload.credentialRecord.id,
        type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
        label: connectionShortDetailsMock.label,
        logo: connectionShortDetailsMock.logo,
      })
    );
  });

  test("handles credential state request sent", async () => {
    const isCredentialRequestSentSpy = jest.spyOn(
      AriesAgent.agent.credentials,
      "isCredentialRequestSent"
    );
    isCredentialRequestSentSpy.mockImplementationOnce(() => true);
    await credentialStateChangedHandler(
      credentialStateChangedEventMock,
      dispatch
    );

    expect(dispatch).toBeCalledWith(
      setToastMsg(ToastMsgType.CREDENTIAL_REQUEST_PENDING)
    );
    expect(dispatch).toBeCalledWith(
      updateOrAddCredsCache({
        id: `metadata:${credentialStateChangedEventMock.payload.credentialRecord.id}`,
        isArchived: false,
        colors: ["#000000", "#000000"],
        credentialType: "",
        issuanceDate:
          credentialStateChangedEventMock.payload.credentialRecord.createdAt.toISOString(),
        status: CredentialMetadataRecordStatus.PENDING,
        connectionId: "cid2",
        connectionType: ConnectionType.DIDCOMM,
      })
    );
  });

  test("handles credential state done", async () => {
    const credentialShortDetail = {
      id: `metadata:${credentialStateChangedEventMock.payload.credentialRecord.id}`,
      isArchived: false,
      colors: ["#000000", "#000000"],
      credentialType: "",
      issuanceDate:
        credentialStateChangedEventMock.payload.credentialRecord.createdAt.toISOString(),
      status: CredentialMetadataRecordStatus.CONFIRMED,
    } as CredentialShortDetails;
    const isCredentialDoneSpy = jest.spyOn(
      AriesAgent.agent.credentials,
      "isCredentialDone"
    );
    isCredentialDoneSpy.mockImplementationOnce(() => true);
    const updateMetadataCompletedSpy = jest.spyOn(
      AriesAgent.agent.credentials,
      "updateMetadataCompleted"
    );
    updateMetadataCompletedSpy.mockResolvedValue(credentialShortDetail);
    await credentialStateChangedHandler(
      credentialStateChangedEventMock,
      dispatch
    );
    expect(dispatch).toBeCalledWith(
      setToastMsg(ToastMsgType.NEW_CREDENTIAL_ADDED)
    );
    expect(dispatch).toBeCalledWith(
      updateOrAddCredsCache(credentialShortDetail)
    );
  });
});
