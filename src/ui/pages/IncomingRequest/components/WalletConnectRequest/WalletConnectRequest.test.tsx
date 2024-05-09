import { setupIonicReact } from "@ionic/react";
import { mockIonicReact, waitForIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { store } from "../../../../../store";
import { IncomingRequestType } from "../../../../../store/reducers/stateCache/stateCache.types";
import { WalletConnectRequestStageOne } from "./WalletConnectRequestStageOne";
import { WalletConnectRequestStageTwo } from "./WalletConnectRequestStageTwo";
import { identifierFix } from "../../../../__fixtures__/identifierFix";
import { TabsRoutePath } from "../../../../../routes/paths";
setupIonicReact();
mockIonicReact();

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, isOpen }: any) => (
    <div style={{ display: isOpen ? "block" : "none" }}>{children}</div>
  ),
}));

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: (key: string) => {
      return "111111";
    },
  },
}));

describe("Wallet Connect Stage One", () => {
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
    type: IncomingRequestType.WALLET_CONNECT_RECEIVED,
  };

  const initiateAnimation = false;
  const handleAccept = jest.fn();
  const handleCancel = jest.fn();
  const handleIgnore = jest.fn();
  const handleChangeStage = jest.fn();

  test("Renders content ", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <WalletConnectRequestStageOne
          pageId={pageId}
          activeStatus={activeStatus}
          blur={blur}
          setBlur={setBlur}
          requestData={requestData}
          initiateAnimation={initiateAnimation}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          handleIgnore={handleIgnore}
          incomingRequestType={IncomingRequestType.WALLET_CONNECT_RECEIVED}
        />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.request.walletconnection.stageone.title)
    ).toBeVisible();

    expect(
      getByText(EN_TRANSLATIONS.request.walletconnection.stageone.message)
    ).toBeVisible();

    expect(getByText(EN_TRANSLATIONS.request.button.accept)).toBeVisible();

    expect(getByText(EN_TRANSLATIONS.request.button.decline)).toBeVisible();
  });

  test("Click to acccept button", async () => {
    const { getByText } = render(
      <Provider store={storeMocked}>
        <WalletConnectRequestStageOne
          pageId={pageId}
          activeStatus={activeStatus}
          blur={blur}
          setBlur={setBlur}
          requestData={requestData}
          initiateAnimation={initiateAnimation}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          handleIgnore={handleIgnore}
          setRequestStage={handleChangeStage}
          incomingRequestType={IncomingRequestType.WALLET_CONNECT_RECEIVED}
        />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByText(EN_TRANSLATIONS.request.button.accept));
    });

    await waitFor(() => {
      expect(handleChangeStage).toBeCalledWith(1);
    });
  });

  test("Click to decline button", async () => {
    const { getByText } = render(
      <Provider store={storeMocked}>
        <WalletConnectRequestStageOne
          pageId={pageId}
          activeStatus={activeStatus}
          blur={blur}
          setBlur={setBlur}
          requestData={requestData}
          initiateAnimation={initiateAnimation}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          handleIgnore={handleIgnore}
          setRequestStage={handleChangeStage}
          incomingRequestType={IncomingRequestType.WALLET_CONNECT_RECEIVED}
        />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByText(EN_TRANSLATIONS.request.button.decline));
    });

    await waitForIonicReact();

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.request.walletconnection.stageone.alert.titleconfirm
        )
      ).toBeInTheDocument();
    });
  });
});

describe("Wallet Connect Stage Two", () => {
  const mockStore = configureStore();

  const initialState = {
    stateCache: {
      routes: [TabsRoutePath.IDENTIFIERS],
      authentication: {
        loggedIn: true,
        time: Date.now(),
        passcodeIsSet: true,
        passwordIsSet: false,
      },
    },
    walletConnectionsCache: {
      walletConnections: [],
    },
    identifiersCache: {
      identifiers: [...identifierFix],
    },
  };

  const dispatchMock = jest.fn();
  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  const pageId = "incoming-request";
  const activeStatus = true;
  const blur = false;
  const setBlur = jest.fn();
  const requestData = {
    id: "abc123456",
    type: IncomingRequestType.WALLET_CONNECT_RECEIVED,
  };

  const initiateAnimation = false;
  const handleAccept = jest.fn();
  const handleCancel = jest.fn();
  const handleIgnore = jest.fn();
  const handleChangeStage = jest.fn();

  test("Renders content ", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <WalletConnectRequestStageTwo
          pageId={pageId}
          activeStatus={activeStatus}
          blur={blur}
          setBlur={setBlur}
          requestData={requestData}
          initiateAnimation={initiateAnimation}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          handleIgnore={handleIgnore}
          incomingRequestType={IncomingRequestType.WALLET_CONNECT_RECEIVED}
        />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.request.walletconnection.stagetwo.title)
    ).toBeVisible();

    expect(
      getByText(EN_TRANSLATIONS.request.walletconnection.stagetwo.message)
    ).toBeVisible();

    expect(getByTestId("primary-button")).toBeVisible();

    expect(getByTestId("primary-button")).toBeDisabled();
  });

  test("Click to confirm button", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <WalletConnectRequestStageTwo
          pageId={pageId}
          activeStatus={activeStatus}
          blur={blur}
          setBlur={setBlur}
          requestData={requestData}
          initiateAnimation={initiateAnimation}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          handleIgnore={handleIgnore}
          setRequestStage={handleChangeStage}
          incomingRequestType={IncomingRequestType.WALLET_CONNECT_RECEIVED}
        />
      </Provider>
    );

    expect(
      getByTestId("identifier-select-" + identifierFix[0].id)
    ).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("identifier-select-" + identifierFix[0].id));
    });

    await waitFor(() => {
      expect(getByTestId("primary-button").getAttribute("disabled")).toBe(
        "false"
      );
    });

    act(() => {
      fireEvent.click(getByTestId("primary-button"));
    });

    await waitFor(() => {
      expect(getByText(EN_TRANSLATIONS.verifypasscode.title)).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-0")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-1")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-2")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-3")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-4")).toBeVisible();
    });

    fireEvent.click(getByTestId("passcode-button-1"));

    await waitFor(() => {
      expect(getByTestId("circle-5")).toBeVisible();
    });

    await waitFor(() => {
      expect(handleCancel).toBeCalled();
    });
  });
});
