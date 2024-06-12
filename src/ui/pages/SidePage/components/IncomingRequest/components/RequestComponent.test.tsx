import { setupIonicReact } from "@ionic/react";
import { mockIonicReact } from "@ionic/react-test-utils";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../../../../locales/en/en.json";
import { store } from "../../../../../../store";
import {
  IncomingRequestProps,
  IncomingRequestType,
} from "../../../../../../store/reducers/stateCache/stateCache.types";
import { connectionsFix } from "../../../../../__fixtures__/connectionsFix";
import { filteredIdentifierFix } from "../../../../../__fixtures__/filteredIdentifierFix";
import {
  signTransactionFix,
  signObjectFix,
} from "../../../../../__fixtures__/signTransactionFix";
import { RequestComponent } from "./RequestComponent";
setupIonicReact();
mockIonicReact();

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonAlert: ({ children }: { children: any }) => children,
}));
jest.mock("../../../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      peerConnectionMetadataStorage: {
        getPeerConnectionMetadata: jest.fn(),
      },
    },
  },
}));
describe("Multi-Sig request", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const storeMocked = {
    ...mockStore(store.getState()),
    dispatch: dispatchMock,
  };

  const pageId = "incoming-request";
  const activeStatus = true;
  const blur = false;
  const setBlur = jest.fn();
  const requestData = {
    id: "abc123456",
    type: IncomingRequestType.MULTI_SIG_REQUEST_INCOMING,
    event: {
      id: "event-id",
      createdAt: new Date(),
      a: { d: "d" },
    },
    multisigIcpDetails: {
      ourIdentifier: filteredIdentifierFix[0],
      sender: connectionsFix[3],
      otherConnections: [connectionsFix[4], connectionsFix[5]],
      threshold: 1,
    },
  };
  const credentialRequestData = {
    id: "id",
    type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
    logo: "logo",
    label: "label",
  };
  const initiateAnimation = false;
  const handleAccept = jest.fn();
  const handleCancel = jest.fn();
  const handleIgnore = jest.fn();

  test("It renders content for CREDENTIAL_OFFER_RECEIVED ", async () => {
    const { getByText } = render(
      <Provider store={storeMocked}>
        <RequestComponent
          pageId={pageId}
          activeStatus={activeStatus}
          blur={blur}
          setBlur={setBlur}
          requestData={credentialRequestData as IncomingRequestProps}
          initiateAnimation={initiateAnimation}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          handleIgnore={handleIgnore}
          incomingRequestType={IncomingRequestType.CREDENTIAL_OFFER_RECEIVED}
        />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.request.credential.title)
    ).toBeInTheDocument();
  });

  test("Display fallback image when provider logo is empty: CREDENTIAL_OFFER_RECEIVED", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <RequestComponent
          pageId={pageId}
          activeStatus={activeStatus}
          blur={blur}
          setBlur={setBlur}
          requestData={credentialRequestData as IncomingRequestProps}
          initiateAnimation={initiateAnimation}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          handleIgnore={handleIgnore}
          incomingRequestType={IncomingRequestType.CREDENTIAL_OFFER_RECEIVED}
        />
      </Provider>
    );

    expect(getByTestId("credential-request-provider-logo")).toBeInTheDocument();

    expect(
      getByTestId("credential-request-provider-logo").getAttribute("src")
    ).not.toBe(undefined);
  });

  test("It renders content for MULTI_SIG_REQUEST_INCOMING - stage 0", async () => {
    const { getByText } = render(
      <Provider store={storeMocked}>
        <RequestComponent
          pageId={pageId}
          activeStatus={activeStatus}
          blur={blur}
          setBlur={setBlur}
          requestData={requestData as IncomingRequestProps}
          initiateAnimation={initiateAnimation}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          handleIgnore={handleIgnore}
          incomingRequestType={IncomingRequestType.MULTI_SIG_REQUEST_INCOMING}
        />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.request.multisig.title)
    ).toBeInTheDocument();
  });

  test("Display fallback image when provider logo is empty: CREDENTIAL_OFFER_RECEIVED MULTI_SIG_REQUEST_INCOMING - stage 0", async () => {
    const data = {
      id: "abc123456",
      type: IncomingRequestType.MULTI_SIG_REQUEST_INCOMING,
      multisigIcpDetails: {
        ourIdentifier: filteredIdentifierFix[0],
        sender: {
          ...connectionsFix[3],
          logo: "",
        },
        otherConnections: [
          {
            ...connectionsFix[4],
            logo: "",
          },
          {
            ...connectionsFix[5],
            logo: "",
          },
        ],
        threshold: 1,
      },
    };

    const { getByText, queryByTestId, getByTestId } = render(
      <Provider store={storeMocked}>
        <RequestComponent
          pageId={pageId}
          activeStatus={activeStatus}
          blur={blur}
          setBlur={setBlur}
          requestData={requestData as IncomingRequestProps}
          initiateAnimation={initiateAnimation}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          handleIgnore={handleIgnore}
          incomingRequestType={IncomingRequestType.MULTI_SIG_REQUEST_INCOMING}
        />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.request.multisig.title)
    ).toBeInTheDocument();

    expect(queryByTestId("multisig-connection-fallback-logo")).toBeVisible();
    expect(
      getByTestId("other-multisig-connection-logo-0").getAttribute("src")
    ).not.toBe(undefined);
    expect(
      getByTestId("other-multisig-connection-logo-1").getAttribute("src")
    ).not.toBe(undefined);
  });
});

describe("Sign request", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const storeMocked = {
    ...mockStore(store.getState()),
    dispatch: dispatchMock,
  };

  const pageId = "incoming-request";
  const activeStatus = true;
  const blur = false;
  const setBlur = jest.fn();
  const requestData = {
    id: "abc123456",
    label: "Cardano",
    type: IncomingRequestType.PEER_CONNECT_SIGN,
    signTransaction: signTransactionFix,
    peerConnection: { id: "id", name: "DApp" },
  };

  const initiateAnimation = false;
  const handleAccept = jest.fn();
  const handleCancel = jest.fn();
  const handleIgnore = jest.fn();

  test("It renders content for BALLOT_TRANSACTION_REQUEST ", async () => {
    const { getByText, getAllByText } = render(
      <Provider store={storeMocked}>
        <RequestComponent
          pageId={pageId}
          activeStatus={activeStatus}
          blur={blur}
          setBlur={setBlur}
          requestData={requestData as IncomingRequestProps}
          initiateAnimation={initiateAnimation}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          handleIgnore={handleIgnore}
          incomingRequestType={IncomingRequestType.PEER_CONNECT_SIGN}
        />
      </Provider>
    );

    expect(getByText(requestData.peerConnection?.name)).toBeVisible();
    expect(
      getByText(requestData.signTransaction.payload.payload)
    ).toBeVisible();
    expect(
      getByText(requestData.signTransaction.payload.identifier)
    ).toBeVisible();
  });

  test("Display fallback image when provider logo is empty: BALLOT_TRANSACTION_REQUEST", async () => {
    const testData = {
      ...requestData,
      logo: "",
    };

    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <RequestComponent
          pageId={pageId}
          activeStatus={activeStatus}
          blur={blur}
          setBlur={setBlur}
          requestData={testData as IncomingRequestProps}
          initiateAnimation={initiateAnimation}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          handleIgnore={handleIgnore}
          incomingRequestType={IncomingRequestType.PEER_CONNECT_SIGN}
        />
      </Provider>
    );

    expect(getByTestId("sign-logo")).toBeInTheDocument();

    expect(getByTestId("sign-logo").getAttribute("src")).not.toBe(undefined);
  });
});

describe("Sign JSON", () => {
  const mockStore = configureStore();
  const dispatchMock = jest.fn();
  const storeMocked = {
    ...mockStore(store.getState()),
    dispatch: dispatchMock,
  };

  const pageId = "incoming-request";
  const activeStatus = true;
  const blur = false;
  const setBlur = jest.fn();
  const requestData = {
    id: "abc123456",
    label: "Cardano",
    type: IncomingRequestType.PEER_CONNECT_SIGN,
    signTransaction: signObjectFix,
    peerConnection: { id: "id", name: "DApp" },
  };

  const initiateAnimation = false;
  const handleAccept = jest.fn();
  const handleCancel = jest.fn();
  const handleIgnore = jest.fn();

  test("It renders content for BALLOT_TRANSACTION_REQUEST ", async () => {
    const { getByText, getAllByText } = render(
      <Provider store={storeMocked}>
        <RequestComponent
          pageId={pageId}
          activeStatus={activeStatus}
          blur={blur}
          setBlur={setBlur}
          requestData={requestData as IncomingRequestProps}
          initiateAnimation={initiateAnimation}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          handleIgnore={handleIgnore}
          incomingRequestType={IncomingRequestType.PEER_CONNECT_SIGN}
        />
      </Provider>
    );

    expect(getByText(requestData.peerConnection?.name)).toBeVisible();
    expect(
      getByText(JSON.parse(signObjectFix.payload.payload).data.id)
    ).toBeVisible();
  });

  test("Display fallback image when provider logo is empty: BALLOT_TRANSACTION_REQUEST", async () => {
    const testData = {
      ...requestData,
      logo: "",
    };

    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <RequestComponent
          pageId={pageId}
          activeStatus={activeStatus}
          blur={blur}
          setBlur={setBlur}
          requestData={testData as IncomingRequestProps}
          initiateAnimation={initiateAnimation}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          handleIgnore={handleIgnore}
          incomingRequestType={IncomingRequestType.PEER_CONNECT_SIGN}
        />
      </Provider>
    );

    expect(getByTestId("sign-logo")).toBeInTheDocument();

    expect(getByTestId("sign-logo").getAttribute("src")).not.toBe(undefined);
  });
});
