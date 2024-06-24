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
import { setPendingConnection } from "../../../../../store/reducers/walletConnectionsCache";

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

jest.mock("../../../../../core/storage", () => ({
  ...jest.requireActual("../../../../../core/storage"),
  SecureStorage: {
    get: (key: string) => {
      return "111111";
    },
    remove: () => jest.fn(),
    set: () => jest.fn(),
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
  biometricsCache: {
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
      biometricsCache: {
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
      biometricsCache: {
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
      biometricsCache: {
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
      expect(
        getByText(
          EN_TRANSLATIONS.menu.tab.items.connectwallet
            .disconnectbeforecreatealert.message
        )
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(
        getByText(
          EN_TRANSLATIONS.menu.tab.items.connectwallet
            .disconnectbeforecreatealert.confirm
        )
      );
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(
        setPendingConnection(walletConnectionsFix[0])
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
      biometricsCache: {
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

  test("Show connection modal after create connect to wallet", async () => {
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: true,
        },
        currentOperation: OperationType.OPEN_WALLET_CONNECTION_DETAIL,
      },
      walletConnectionsCache: {
        walletConnections: [
          ...walletConnectionsFix,
          {
            ...walletConnectionsFix[0],
            name: undefined,
            url: undefined,
          },
        ],
        connectedWallet: null,
        pendingConnection: walletConnectionsFix[0],
      },
      identifiersCache: {
        identifiers: [
          {
            signifyName: "Test",
            id: "EN5dwY0N7RKn6OcVrK7ksIniSgPcItCuBRax2JFUpuRd",
            displayName: "Professional ID",
            createdAtUTC: "2023-01-01T19:23:24Z",
            isPending: false,
            theme: 0,
            s: 4, // Sequence number, only show if s > 0
            dt: "2023-06-12T14:07:53.224866+00:00", // Last key rotation timestamp, if s > 0
            kt: 2, // Keys signing threshold (only show if kt > 1)
            k: [
              // List of signing keys - array
              "DCF6b0c5aVm_26_sCTgLB4An6oUxEM5pVDDLqxxXDxH-",
            ],
            nt: 3, // Next keys signing threshold, only show if nt > 1
            n: [
              // Next keys digests - array
              "EIZ-n_hHHY5ERGTzvpXYBkB6_yBAM4RXcjQG3-JykFvF",
            ],
            bt: 1, // Backer threshold and backer keys below
            b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"], // List of backers
            di: "test", // Delegated identifier prefix, don't show if ""
          },
        ],
      },
      biometricsCache: {
        enabled: false,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByTestId, getByText, rerender } = render(
      <MemoryRouter>
        <Provider store={storeMocked}>
          <ConnectWallet />
        </Provider>
      </MemoryRouter>
    );

    const updatedStore = {
      stateCache: {
        routes: [TabsRoutePath.IDENTIFIERS],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
          passwordIsSet: true,
        },
        currentOperation: OperationType.IDLE,
        toastMsg: ToastMsgType.CONNECT_WALLET_SUCCESS,
      },
      walletConnectionsCache: {
        walletConnections: [
          ...walletConnectionsFix,
          {
            ...walletConnectionsFix[0],
          },
        ],
        connectedWallet: null,
        pendingConnection: null,
      },
      identifiersCache: {
        identifiers: [
          {
            signifyName: "Test",
            id: "EN5dwY0N7RKn6OcVrK7ksIniSgPcItCuBRax2JFUpuRd",
            displayName: "Professional ID",
            createdAtUTC: "2023-01-01T19:23:24Z",
            isPending: false,
            theme: 0,
            s: 4, // Sequence number, only show if s > 0
            dt: "2023-06-12T14:07:53.224866+00:00", // Last key rotation timestamp, if s > 0
            kt: 2, // Keys signing threshold (only show if kt > 1)
            k: [
              // List of signing keys - array
              "DCF6b0c5aVm_26_sCTgLB4An6oUxEM5pVDDLqxxXDxH-",
            ],
            nt: 3, // Next keys signing threshold, only show if nt > 1
            n: [
              // Next keys digests - array
              "EIZ-n_hHHY5ERGTzvpXYBkB6_yBAM4RXcjQG3-JykFvF",
            ],
            bt: 1, // Backer threshold and backer keys below
            b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"], // List of backers
            di: "test", // Delegated identifier prefix, don't show if ""
          },
        ],
      },
      biometricsCache: {
        enabled: false,
      },
    };

    const updateStoreMocked = {
      ...mockStore(updatedStore),
      dispatch: dispatchMock,
    };

    await waitFor(() => {
      expect(getByTestId("connect-wallet-title")).toBeVisible();
    });

    rerender(
      <MemoryRouter>
        <Provider store={updateStoreMocked}>
          <ConnectWallet />
        </Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId("connection-id")).toBeVisible();
    });
  });
});
