import { mockIonicReact } from "@ionic/react-test-utils";
mockIonicReact();
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { EventEmitter } from "events";
import { Provider } from "react-redux";
import { store } from "../../../store";
import { IncomingRequest } from "./IncomingRequest";
import { IncomingRequestType } from "../../../store/reducers/stateCache/stateCache.types";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { setQueueIncomingRequest } from "../../../store/reducers/stateCache";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";
import { EventService } from "../../../core/agent/services/eventService";
import { SignifyNotificationService } from "../../../core/agent/services/signifyNotificationService";

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        acceptRequestConnection: jest.fn(),
        acceptResponseConnection: jest.fn(),
      },
      credentials: {
        acceptCredentialOffer: jest.fn(),
        declineCredentialOffer: jest.fn(),
      },
    },
  },
}));

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: jest.fn(),
  },
}));

const eventEmitter = new EventEmitter();

const agent = jest.mocked({
  credentials: {
    acceptOffer: jest.fn(),
    proposeCredential: jest.fn(),
    deleteById: jest.fn(),
    getById: jest.fn(),
    findOfferMessage: jest.fn(),
    negotiateOffer: jest.fn(),
    findAllByQuery: jest.fn(),
  },
  connections: {
    findById: jest.fn(),
  },
  events: {
    on: eventEmitter.on.bind(eventEmitter),
    emit: jest.fn(),
  },
  eventEmitter: {
    emit: eventEmitter.emit.bind(eventEmitter),
  },
  modules: {
    generalStorage: {
      getAllCredentialMetadata: jest.fn(),
      updateCredentialMetadata: jest.fn(),
      deleteCredentialMetadata: jest.fn(),
      getCredentialMetadata: jest.fn(),
      saveCredentialMetadataRecord: jest.fn(),
      getCredentialMetadataByCredentialRecordId: jest.fn(),
      getIdentifierMetadata: jest.fn(),
    },
  },
  dids: {
    getCreatedDids: jest.fn(),
  },
  genericRecords: {
    save: jest.fn(),
    findAllByQuery: jest.fn(),
    findById: jest.fn(),
    deleteById: jest.fn(),
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

const identifiersListMock = jest.fn();
const identifiersGetMock = jest.fn();
const identifiersCreateMock = jest.fn();
const identifiersMemberMock = jest.fn();
const identifiersInteractMock = jest.fn();
const identifiersRotateMock = jest.fn();

const oobiResolveMock = jest.fn();
const groupGetRequestMock = jest.fn();
const queryKeyStateMock = jest.fn();
const credentialListMock = jest.fn();

const signifyClient = jest.mocked({
  connect: jest.fn(),
  boot: jest.fn(),
  identifiers: () => ({
    list: identifiersListMock,
    get: identifiersGetMock,
    create: identifiersCreateMock,
    addEndRole: jest.fn(),
    interact: identifiersInteractMock,
    rotate: identifiersRotateMock,
    members: identifiersMemberMock,
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
    resolve: oobiResolveMock,
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
    list: credentialListMock,
  }),
  exchanges: () => ({
    get: jest.fn(),
    send: jest.fn(),
  }),
  agent: {
    pre: "pre",
  },
  keyStates: () => ({
    query: queryKeyStateMock,
    get: jest.fn(),
  }),

  groups: () => ({ getRequest: groupGetRequestMock }),
});
const identifierStorage = jest.mocked({
  getIdentifierMetadata: jest.fn(),
  getAllIdentifierMetadata: jest.fn(),
  getKeriIdentifiersMetadata: jest.fn(),
  updateIdentifierMetadata: jest.fn(),
  createIdentifierMetadataRecord: jest.fn(),
});

const credentialStorage = jest.mocked({
  getAllCredentialMetadata: jest.fn(),
  deleteCredentialMetadata: jest.fn(),
  getCredentialMetadata: jest.fn(),
  getCredentialMetadataByCredentialRecordId: jest.fn(),
  getCredentialMetadataByConnectionId: jest.fn(),
  saveCredentialMetadataRecord: jest.fn(),
  updateCredentialMetadata: jest.fn(),
});

const agentServicesProps = {
  basicStorage: basicStorage as any,
  signifyClient: signifyClient as any,
  eventService: new EventService(),
  identifierStorage: identifierStorage as any,
  credentialStorage: credentialStorage as any,
};

const signifyNotificationService = new SignifyNotificationService(
  agentServicesProps
);

describe("Multi-Sig request", () => {
  const requestDetails = {
    id: "abc123456",
    type: IncomingRequestType.MULTI_SIG_REQUEST_INCOMING,
    multisigIcpDetails: {
      ourIdentifier: filteredIdentifierFix[0],
      sender: connectionsFix[3],
      otherConnections: [connectionsFix[4], connectionsFix[5]],
      threshold: 1,
    },
  };

  afterEach(async () => {
    await signifyNotificationService.deleteNotificationRecordById(
      requestDetails.id
    );
  });

  test("It receives incoming Multi-Sig request and render content in MultiSigRequestStageOne", async () => {
    store.dispatch(setQueueIncomingRequest(requestDetails));

    const { getByText } = render(
      <Provider store={store}>
        <IncomingRequest />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.request.multisig.stageone.title)
    ).toBeInTheDocument();
    expect(
      getByText(requestDetails.multisigIcpDetails.sender.label)
    ).toBeInTheDocument();
    expect(
      getByText(requestDetails.multisigIcpDetails.otherConnections[0].label)
    ).toBeInTheDocument();
    expect(
      getByText(requestDetails.multisigIcpDetails.otherConnections[1].label)
    ).toBeInTheDocument();
    expect(
      getByText(requestDetails.multisigIcpDetails.threshold.toString())
    ).toBeInTheDocument();
  });

  test("Selecting Cancel will open the Alert pop-up", async () => {
    store.dispatch(setQueueIncomingRequest(requestDetails));
    const { getByText } = render(
      <Provider store={store}>
        <IncomingRequest />
      </Provider>
    );

    const footerCancelButton = getByText(
      EN_TRANSLATIONS.request.button.decline
    );
    act(() => {
      fireEvent.click(footerCancelButton);
    });
    expect(
      getByText(EN_TRANSLATIONS.request.multisig.stageone.alert.textdecline)
    ).toBeInTheDocument();
  });

  test("Selecting Accept will open the Alert pop-up", async () => {
    store.dispatch(setQueueIncomingRequest(requestDetails));
    const { getByText } = render(
      <Provider store={store}>
        <IncomingRequest />
      </Provider>
    );

    const continueButton = getByText(EN_TRANSLATIONS.request.button.accept);
    act(() => {
      fireEvent.click(continueButton);
    });
    expect(
      getByText(EN_TRANSLATIONS.request.multisig.stageone.alert.textaccept)
    ).toBeInTheDocument();
  });
});
