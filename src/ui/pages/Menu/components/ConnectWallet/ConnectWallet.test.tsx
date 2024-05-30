import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import EN_TRANSLATIONS from "../../../../../locales/en/en.json";
import { TabsRoutePath } from "../../../../../routes/paths";
import { walletConnectionsFix } from "../../../../__fixtures__/walletConnectionsFix";
import { ConnectWallet } from "./ConnectWallet";
import {
  setCurrentOperation,
  setToastMsg,
} from "../../../../../store/reducers/stateCache";
import { OperationType, ToastMsgType } from "../../../../globals/types";
import { identifierFix } from "../../../../__fixtures__/identifierFix";
import { PeerConnection } from "../../../../../core/cardano/walletConnect/peerConnection";
import { setPendingDAppMeerKat } from "../../../../../store/reducers/walletConnectionsCache";

jest.mock("../../../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      peerConnectionMetadataStorage: {
        getAllPeerConnectionMetadata: jest.fn(),
        deletePeerConnectionMetadataRecord: jest.fn(),
      },
    },
  },
}));

jest.mock("../../../../../core/cardano/walletConnect/peerConnection", () => ({
  PeerConnection: {
    peerConnection: {
      disconnectDApp: jest.fn(),
    },
  },
}));

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  IonModal: ({ children, isOpen }: any) => (
    <div
      style={{ display: isOpen ? "block" : "none" }}
      data-testid="add-connection-modal"
    >
      {children}
    </div>
  ),
}));

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: (key: string) => {
      return "111111";
    },
  },
}));

const mockStore = configureStore();
const dispatchMock = jest.fn();
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
    walletConnections: [...walletConnectionsFix],
    connectedWallet: walletConnectionsFix[1],
  },
  identifiersCache: {
    identifiers: [...identifierFix],
  },
  biometryCache: {
    enabled: false,
  },
};

const storeMocked = {
  ...mockStore(initialState),
  dispatch: dispatchMock,
};

describe("Wallet connect: empty history", () => {
  test("Confirm connect modal render empty history screen", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: true,
        },
      },
      walletConnectionsCache: {
        walletConnections: [],
      },
      identifiersCache: {
        identifiers: [...identifierFix],
      },
      biometryCache: {
        enabled: false,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByText } = render(
      <Provider store={storeMocked}>
        <ConnectWallet />
      </Provider>
    );

    expect(
      getByText(EN_TRANSLATIONS.menu.tab.items.connectwallet.connectbtn)
    ).toBeVisible();
  });

  test("Connect wallet modal: scan QR", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: true,
        },
      },
      walletConnectionsCache: {
        walletConnections: [],
      },
      identifiersCache: {
        identifiers: [...identifierFix],
      },
      biometryCache: {
        enabled: false,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByText, getByTestId } = render(
      <MemoryRouter>
        <Provider store={storeMocked}>
          <ConnectWallet />
        </Provider>
      </MemoryRouter>
    );

    expect(
      getByText(EN_TRANSLATIONS.menu.tab.items.connectwallet.connectbtn)
    ).toBeVisible();

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.menu.tab.items.connectwallet.connectbtn)
      );
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setCurrentOperation(OperationType.SCAN_WALLET_CONNECTION)
      );
    });
  });

  test("Connect wallet modal: alert identifier missing when create new connect", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: true,
        },
      },
      walletConnectionsCache: {
        walletConnections: [],
      },
      identifiersCache: {
        identifiers: [],
      },
      biometryCache: {
        enabled: false,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByText, getByTestId } = render(
      <MemoryRouter>
        <Provider store={storeMocked}>
          <ConnectWallet />
        </Provider>
      </MemoryRouter>
    );

    expect(
      getByText(EN_TRANSLATIONS.menu.tab.items.connectwallet.connectbtn)
    ).toBeVisible();

    act(() => {
      fireEvent.click(
        getByText(EN_TRANSLATIONS.menu.tab.items.connectwallet.connectbtn)
      );
    });

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.menu.tab.items.connectwallet.connectionhistory
            .missingidentifieralert.message
        )
      ).toBeVisible();
    });
  });
});

describe("Wallet connect", () => {
  test("Wallet connect render", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <ConnectWallet />
      </Provider>
    );

    expect(
      getByText(
        EN_TRANSLATIONS.menu.tab.items.connectwallet.connectionhistory.title
      )
    ).toBeVisible();
    expect(getByText(walletConnectionsFix[0].name as string)).toBeVisible();
    expect(getByText(walletConnectionsFix[0].url as string)).toBeVisible();
    expect(getByText(walletConnectionsFix[1].name as string)).toBeVisible();
    expect(getByText(walletConnectionsFix[1].url as string)).toBeVisible();
    expect(getByText(walletConnectionsFix[2].name as string)).toBeVisible();
    expect(getByText(walletConnectionsFix[2].url as string)).toBeVisible();
    expect(getByText(walletConnectionsFix[3].name as string)).toBeVisible();
    expect(getByText(walletConnectionsFix[3].url as string)).toBeVisible();
    expect(getByTestId("connected-wallet-check-mark")).toBeVisible();
  });

  test("Confirm connect modal render", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <ConnectWallet />
      </Provider>
    );

    expect(
      getByText(
        EN_TRANSLATIONS.menu.tab.items.connectwallet.connectionhistory.title
      )
    ).toBeVisible();
    expect(getByText(walletConnectionsFix[0].name as string)).toBeVisible();
    expect(getByText(walletConnectionsFix[0].url as string)).toBeVisible();
    expect(getByText(walletConnectionsFix[1].name as string)).toBeVisible();
    expect(getByText(walletConnectionsFix[1].url as string)).toBeVisible();
    expect(getByText(walletConnectionsFix[2].name as string)).toBeVisible();
    expect(getByText(walletConnectionsFix[2].url as string)).toBeVisible();
    expect(getByText(walletConnectionsFix[3].name as string)).toBeVisible();
    expect(getByText(walletConnectionsFix[3].url as string)).toBeVisible();
    expect(getByTestId("connected-wallet-check-mark")).toBeVisible();
  });

  test("Delete wallet connections", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <ConnectWallet />
      </Provider>
    );

    expect(
      getByText(
        EN_TRANSLATIONS.menu.tab.items.connectwallet.connectionhistory.title
      )
    ).toBeVisible();

    act(() => {
      fireEvent.click(
        getByTestId(`delete-connections-${walletConnectionsFix[0].id}`)
      );
    });

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.menu.tab.items.connectwallet.connectionhistory
            .deletealert.message
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByText(
          EN_TRANSLATIONS.menu.tab.items.connectwallet.connectionhistory
            .deletealert.confirm
        )
      );
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
      expect(dispatchMock).toBeCalledWith(
        setToastMsg(ToastMsgType.WALLET_CONNECTION_DELETED)
      );
    });
  });

  test("Connect wallet", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <ConnectWallet />
      </Provider>
    );

    expect(
      getByText(
        EN_TRANSLATIONS.menu.tab.items.connectwallet.connectionhistory.title
      )
    ).toBeVisible();

    act(() => {
      fireEvent.click(getByTestId(`card-item-${walletConnectionsFix[0].id}`));
    });

    await waitFor(() => {
      expect(getByTestId("confirm-connect-btn")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("confirm-connect-btn"));
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setPendingDAppMeerKat(walletConnectionsFix[0].id)
      );
    });

    act(() => {
      fireEvent.click(getByTestId(`card-item-${walletConnectionsFix[1].id}`));
    });

    await waitFor(() => {
      expect(getByTestId("confirm-connect-btn")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("confirm-connect-btn"));
    });
    await waitFor(() => {
      expect(PeerConnection.peerConnection.disconnectDApp).toBeCalledWith(
        walletConnectionsFix[1].id
      );
    });
  });

  test("Wallet connect modal: alert identifier missing", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: true,
        },
      },
      walletConnectionsCache: {
        walletConnections: [...walletConnectionsFix],
        connectedWallet: null,
      },
      identifiersCache: {
        identifiers: [],
      },
      biometryCache: {
        enabled: false,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByTestId, getByText } = render(
      <MemoryRouter>
        <Provider store={storeMocked}>
          <ConnectWallet />
        </Provider>
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(getByTestId(`card-item-${walletConnectionsFix[0].id}`));
    });

    await waitFor(() => {
      expect(getByTestId("confirm-connect-btn")).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("confirm-connect-btn"));
    });

    await waitFor(() => {
      expect(
        getByText(
          EN_TRANSLATIONS.menu.tab.items.connectwallet.connectionhistory
            .missingidentifieralert.message
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByText(
          EN_TRANSLATIONS.menu.tab.items.connectwallet.connectionhistory
            .missingidentifieralert.confirm
        )
      );
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setCurrentOperation(OperationType.CREATE_IDENTIFIER_CONNECT_WALLET)
      );
    });
  });
});
