import { mockIonicReact } from "@ionic/react-test-utils";
import { setupIonicReact } from "@ionic/react";
setupIonicReact();
mockIonicReact();
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { IncomingRequestType } from "../../../../store/reducers/stateCache/stateCache.types";
import { connectionsFix } from "../../../__fixtures__/connectionsFix";
import EN_TRANSLATIONS from "../../../../locales/en/en.json";
import { filteredIdentifierFix } from "../../../__fixtures__/filteredIdentifierFix";
import { RequestComponent } from "./RequestComponent";
import { store } from "../../../../store";
import { signTransactionFix } from "../../../__fixtures__/signTransactionFix";

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonAlert: ({ children }: { children: any }) => children,
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
    multisigIcpDetails: {
      ourIdentifier: filteredIdentifierFix[0],
      sender: connectionsFix[3],
      otherConnections: [connectionsFix[4], connectionsFix[5]],
      threshold: 1,
    },
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
          requestData={requestData}
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
          requestData={testData}
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
          requestData={requestData}
          initiateAnimation={initiateAnimation}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          handleIgnore={handleIgnore}
          incomingRequestType={IncomingRequestType.MULTI_SIG_REQUEST_INCOMING}
        />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.request.multisig.stageone.title)
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
          requestData={requestData}
          initiateAnimation={initiateAnimation}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          handleIgnore={handleIgnore}
          incomingRequestType={IncomingRequestType.MULTI_SIG_REQUEST_INCOMING}
        />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.request.multisig.stageone.title)
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
    type: IncomingRequestType.SIGN_TRANSACTION_REQUEST,
    ballotData: signTransactionFix,
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
          requestData={requestData}
          initiateAnimation={initiateAnimation}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          handleIgnore={handleIgnore}
          incomingRequestType={IncomingRequestType.SIGN_TRANSACTION_REQUEST}
        />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.request.signtransaction.title)
    ).toBeVisible();

    expect(getByText(requestData.label)).toBeVisible();
    expect(getByText(signTransactionFix.action)).toBeVisible();
    expect(getByText(signTransactionFix.actionText)).toBeVisible();
    expect(getByText(signTransactionFix.data.id)).toBeVisible();
    expect(getByText(signTransactionFix.data.category)).toBeVisible();
    expect(getByText(signTransactionFix.data.event)).toBeVisible();
    expect(getByText(signTransactionFix.data.network)).toBeVisible();
    expect(getByText(signTransactionFix.data.proposal)).toBeVisible();
    expect(getByText(signTransactionFix.data.votedAt)).toBeVisible();
    expect(getByText(signTransactionFix.data.votingPower)).toBeVisible();
    expect(getByText(signTransactionFix.eventName)).toBeVisible();
    expect(getByText(signTransactionFix.ownerUrl)).toBeVisible();
    expect(getByText(signTransactionFix.slot)).toBeVisible();
    expect(getByText(signTransactionFix.uri)).toBeVisible();
    expect(getAllByText(signTransactionFix.data.address).length).toBe(2);
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
          requestData={testData}
          initiateAnimation={initiateAnimation}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          handleIgnore={handleIgnore}
          incomingRequestType={IncomingRequestType.SIGN_TRANSACTION_REQUEST}
        />
      </Provider>
    );

    expect(getByTestId("sign-logo")).toBeInTheDocument();

    expect(getByTestId("sign-logo").getAttribute("src")).not.toBe(undefined);
  });
});
