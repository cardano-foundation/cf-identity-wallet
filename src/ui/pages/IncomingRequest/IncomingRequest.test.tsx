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

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: jest.fn(),
  },
}));

const notificationStorage = jest.mocked({
  open: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const identifierStorage = jest.mocked({
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

const agentServicesProps = {
  signifyClient: signifyClient as any,
  eventService: new EventService(),
};

const signifyNotificationService = new SignifyNotificationService(
  agentServicesProps,
  notificationStorage as any,
  identifierStorage as any
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
