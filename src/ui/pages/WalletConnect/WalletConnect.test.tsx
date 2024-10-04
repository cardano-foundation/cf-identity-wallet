import { setupIonicReact } from "@ionic/react";
import { mockIonicReact, waitForIonicReact } from "@ionic/react-test-utils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { TabsRoutePath } from "../../../routes/paths";
import { store } from "../../../store";
import { identifierFix } from "../../__fixtures__/identifierFix";
import { walletConnectionsFix } from "../../__fixtures__/walletConnectionsFix";
import { WalletConnect } from "./WalletConnect";
import { WalletConnectStageOne } from "./WalletConnectStageOne";
import { WalletConnectStageTwo } from "./WalletConnectStageTwo";
setupIonicReact();
mockIonicReact();

const identifierCache = [
  {
    displayName: "mutil sign",
    id: "testid_00",
    signifyName: "178a2adb-4ce0-4acd-984d-f1408c8a1087",
    createdAtUTC: "2024-07-02T02:59:06.013Z",
    theme: 0,
    isPending: false,
    multisigManageAid: "EHNPqg5RyNVWfpwUYDK135xuUMFGK1GXZoDVqGc0DPsy",
  },
  {
    displayName: "mutil sign 1",
    id: "testid_0",
    signifyName: "178a2adb-4ce0-4acd-984d-f1408c8a1087",
    createdAtUTC: "2024-07-02T02:59:06.013Z",
    theme: 0,
    isPending: false,
    groupMetadata: {
      groupId: "test",
      groupInitiator: true,
      groupCreated: true,
    },
  },
  {
    displayName: "mutil sign 2",
    id: "testid_1",
    signifyName: "178a2adb-4ce0-4acd-984d-f1408c8a1087",
    createdAtUTC: "2024-07-02T02:59:06.013Z",
    theme: 0,
    isPending: false,
  },
];

jest.mock("../../../../../core/cardano/walletConnect/peerConnection", () => ({
  PeerConnection: {
    peerConnection: {
      start: jest.fn(),
      connectWithDApp: jest.fn(),
    },
  },
}));
jest.mock("../../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      peerConnectionMetadataStorage: {
        getPeerConnectionMetadata: jest.fn(),
        getAllPeerConnectionMetadata: jest.fn(),
      },
    },
  },
}));
jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, isOpen }: any) => (
    <div style={{ display: isOpen ? "block" : "none" }}>{children}</div>
  ),
}));

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: () => {
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

  const handleAccept = jest.fn();
  const handleCancel = jest.fn();

  test("Renders content ", async () => {
    const { getByText } = render(
      <Provider store={storeMocked}>
        <WalletConnectStageOne
          isOpen={true}
          onAccept={handleAccept}
          onClose={handleCancel}
        />
      </Provider>
    );

    expect(
      getByText(
        EN_TRANSLATIONS.menu.tab.items.connectwallet.request.stageone.title
      )
    ).toBeVisible();

    expect(
      getByText(
        EN_TRANSLATIONS.menu.tab.items.connectwallet.request.stageone.message
      )
    ).toBeVisible();

    expect(getByText(EN_TRANSLATIONS.request.button.accept)).toBeVisible();

    expect(getByText(EN_TRANSLATIONS.request.button.decline)).toBeVisible();
  });

  test("Click to acccept button", async () => {
    const { getByText } = render(
      <Provider store={storeMocked}>
        <WalletConnectStageOne
          isOpen={true}
          onAccept={handleAccept}
          onClose={handleCancel}
        />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByText(EN_TRANSLATIONS.request.button.accept));
    });

    await waitFor(() => {
      expect(handleAccept).toBeCalled();
    });
  });

  test("Click to decline button", async () => {
    const { getByText, getAllByText } = render(
      <Provider store={storeMocked}>
        <WalletConnectStageOne
          isOpen={true}
          onAccept={handleAccept}
          onClose={handleCancel}
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
          EN_TRANSLATIONS.menu.tab.items.connectwallet.request.stageone.alert
            .titleconfirm
        )
      ).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(
        getAllByText(
          EN_TRANSLATIONS.menu.tab.items.connectwallet.request.stageone.alert
            .confirm
        )[1]
      );
    });

    await waitFor(() => {
      expect(handleCancel).toBeCalled();
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
      identifiers: identifierCache,
    },
  };

  const dispatchMock = jest.fn();
  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  const handleCancel = jest.fn();
  const handleChangeStage = jest.fn();

  test("Renders content ", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <WalletConnectStageTwo
          isOpen={true}
          pendingDAppMeerkat={"pending-meerkat"}
          onClose={handleCancel}
          onBackClick={handleChangeStage}
        />
      </Provider>
    );

    expect(
      getByText(
        EN_TRANSLATIONS.menu.tab.items.connectwallet.request.stagetwo.title
      )
    ).toBeVisible();

    expect(
      getByText(
        EN_TRANSLATIONS.menu.tab.items.connectwallet.request.stagetwo.message
      )
    ).toBeVisible();

    expect(getByTestId(`card-item-${identifierCache[2].id}`)).toBeVisible();

    expect(getByTestId("primary-button")).toBeVisible();

    expect(getByTestId("primary-button")).toBeDisabled();
  });

  test("Click to confirm button", async () => {
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <WalletConnectStageTwo
          isOpen={true}
          pendingDAppMeerkat={"pending-meerkat"}
          onClose={handleCancel}
          onBackClick={handleChangeStage}
        />
      </Provider>
    );

    expect(
      getByTestId("identifier-select-" + identifierCache[2].id)
    ).toBeVisible();

    act(() => {
      fireEvent.click(
        getByTestId("identifier-select-" + identifierCache[2].id)
      );
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
      expect(dispatchMock).toBeCalled();
    });
  });
});

describe("Wallet Connect Request", () => {
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
      pendingConnection: walletConnectionsFix[0],
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

  test("Renders content ", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <WalletConnect
          open={true}
          setOpenPage={jest.fn()}
        />
      </Provider>
    );

    expect(
      getByText(
        EN_TRANSLATIONS.menu.tab.items.connectwallet.request.stageone.title
      )
    ).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("primary-button-connect-wallet-stage-one"));
    });

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.menu.tab.items.connectwallet.request.stagetwo.title
        )
      ).toBeVisible();
    });

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
      expect(dispatchMock).toBeCalled();
    });
  });

  test("Renders close in stage one ", async () => {
    const { getByTestId, getByText, getAllByText, queryByTestId } = render(
      <Provider store={storeMocked}>
        <WalletConnect
          open={true}
          setOpenPage={jest.fn()}
        />
      </Provider>
    );

    expect(
      getByText(
        EN_TRANSLATIONS.menu.tab.items.connectwallet.request.stageone.title
      )
    ).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId("secondary-button-connect-wallet-stage-one"));
    });
    await waitForIonicReact();

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.menu.tab.items.connectwallet.request.stageone.alert
            .titleconfirm
        )
      ).toBeInTheDocument();
    });

    act(() => {
      fireEvent.click(
        getAllByText(
          EN_TRANSLATIONS.menu.tab.items.connectwallet.request.stageone.alert
            .confirm
        )[1]
      );
    });

    await waitFor(() => {
      expect(queryByTestId("connect-wallet-stage-one")).toBe(null);
      expect(queryByTestId("connect-wallet-stage-two")).toBe(null);
    });
  });
});
