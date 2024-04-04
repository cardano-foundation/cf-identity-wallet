import { mockIonicReact } from "@ionic/react-test-utils";
mockIonicReact();
import { act, fireEvent, render } from "@testing-library/react";
import { EventEmitter } from "events";
import { Provider } from "react-redux";
import { store } from "../../../store";
import { IncomingRequest } from "./IncomingRequest";
import { IncomingRequestType } from "../../../store/reducers/stateCache/stateCache.types";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import {
  setQueueIncomingRequest,
  dequeueCredentialRequest,
} from "../../../store/reducers/stateCache";
import { ConnectionType } from "../../../core/agent/agent.types";
import { filteredKeriFix } from "../../__fixtures__/filteredIdentifierFix";
import { CredentialService } from "../../../core/agent/services";
import { SignifyApi } from "../../../core/agent/modules/signify/signifyApi";

jest.mock("../../../core/agent/agent", () => ({
  AriesAgent: {
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
  w3cCredentials: {
    getCredentialRecordById: jest.fn(),
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

const signifyApi = jest.mocked({
  admitIpex: jest.fn(),
  getNotifications: jest.fn(),
  markNotification: jest.fn(),
  getKeriExchange: jest.fn(),
  getCredentials: jest.fn(),
  getCredentialBySaid: jest.fn(),
});

const credentialService = new CredentialService(
  basicStorage,
  signifyApi as any as SignifyApi
);

const connectionMock = connectionsFix[0];

describe("Connection request", () => {
  // afterEach(() => {
  //   store.dispatch(dequeueCredentialRequest());
  // });
  //   test("It renders connection request incoming", async () => {
  //     store.dispatch(
  //       setQueueIncomingRequest({
  //         id: "123",
  //         type: IncomingRequestType.CONNECTION_INCOMING,
  //         logo: connectionMock.logo,
  //         label: connectionMock.label,
  //       })
  //     );
  //     const { container, getByText } = render(
  //       <Provider store={store}>
  //         <IncomingRequest />
  //       </Provider>
  //     );
  //     await waitFor(
  //       () => {
  //         const title = container.querySelector("h2");
  //         const label = getByText(connectionMock.label);
  //         expect(title).toHaveTextContent(
  //           i18n.t("request.connection.title").toString()
  //         );
  //         expect(label).toBeInTheDocument();
  //       },
  //       { container: container }
  //     );
  //   });
  //   test("It renders connection request incoming and confirm request", async () => {
  //     const id = "123";
  //     store.dispatch(
  //       setQueueIncomingRequest({
  //         id: id,
  //         type: IncomingRequestType.CONNECTION_INCOMING,
  //         logo: connectionMock.logo,
  //         label: connectionMock.label,
  //       })
  //     );
  //     const acceptRequestConnectionSpy = jest.spyOn(
  //       AriesAgent.agent.connections,
  //       "acceptRequestConnection"
  //     );
  //     const { findByTestId } = render(
  //       <Provider store={store}>
  //         <IncomingRequest />
  //       </Provider>
  //     );
  //     const continueButton = await findByTestId(
  //       "primary-button-incoming-request"
  //     );
  //     expect(continueButton).toBeInTheDocument();
  //     act(() => {
  //       continueButton.click();
  //     });
  //     await waitFor(() => {
  //       expect(acceptRequestConnectionSpy).toBeCalledWith(id);
  //     });
  //   });
  //   test("It renders connection response and confirm request", async () => {
  //     const id = "123";
  //     store.dispatch(
  //       setQueueIncomingRequest({
  //         id: id,
  //         type: IncomingRequestType.CONNECTION_RESPONSE,
  //         logo: connectionMock.logo,
  //         label: connectionMock.label,
  //       })
  //     );
  //     const acceptResponseConnectionSpy = jest.spyOn(
  //       AriesAgent.agent.connections,
  //       "acceptResponseConnection"
  //     );
  //     const { findByTestId } = render(
  //       <Provider store={store}>
  //         <IncomingRequest />
  //       </Provider>
  //     );
  //     const continueButton = await findByTestId(
  //       "primary-button-incoming-request"
  //     );
  //     act(() => {
  //       fireEvent.click(continueButton);
  //     });
  //     expect(acceptResponseConnectionSpy).toBeCalledWith(id);
  //   });
  // });
  // describe("Credential request", () => {
  //   afterEach(() => {
  //     store.dispatch(dequeueCredentialCredentialRequest());
  //   });
  //   test("It renders credential request and accept credential", async () => {
  //     const id = "456";
  //     store.dispatch(
  //       setQueueIncomingRequest({
  //         id: id,
  //         type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
  //         logo: connectionMock.logo,
  //         label: connectionMock.label,
  //       })
  //     );
  //     const acceptCredentialOfferSpy = jest.spyOn(
  //       AriesAgent.agent.credentials,
  //       "acceptCredentialOffer"
  //     );
  //     const { findByTestId } = render(
  //       <Provider store={store}>
  //         <IncomingRequest />
  //       </Provider>
  //     );
  //     const continueButton = await findByTestId(
  //       "primary-button-incoming-request"
  //     );
  //     act(() => {
  //       fireEvent.click(continueButton);
  //     });
  //     expect(acceptCredentialOfferSpy).toBeCalledWith(id);
  //   });
  //   test("It renders credential request and decline credential", async () => {
  //     const id = "68";
  //     store.dispatch(
  //       setQueueIncomingRequest({
  //         id: id,
  //         type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
  //       })
  //     );
  //     const declineCredentialOfferSpy = jest.spyOn(
  //       AriesAgent.agent.credentials,
  //       "declineCredentialOffer"
  //     );
  //     const { findByText } = render(
  //       <Provider store={store}>
  //         <IncomingRequest />
  //       </Provider>
  //     );
  //     const btnCancel = await findByText(
  //       i18n.t("request.alert.cancel").toString()
  //     );
  //     act(() => {
  //       btnCancel.click();
  //     });
  //     await waitFor(() => {
  //       expect(declineCredentialOfferSpy).toBeCalledWith(id);
  //     });
  //   });
});

describe("Multi-Sig request", () => {
  const requestDetails = {
    id: "abc123456",
    type: IncomingRequestType.MULTI_SIG_REQUEST_INCOMING,
    source: ConnectionType.KERI,
    multisigIcpDetails: {
      ourIdentifier: filteredKeriFix[0],
      sender: connectionsFix[3],
      otherConnections: [connectionsFix[4], connectionsFix[5]],
      threshold: 1,
    },
  };

  afterEach(async () => {
    await credentialService.deleteKeriNotificationRecordById(requestDetails.id);
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
