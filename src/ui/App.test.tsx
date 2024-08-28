import { render, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import { Style, StyleOptions } from "@capacitor/status-bar";
import { App } from "./App";
import { TabsRoutePath } from "../routes/paths";
import { store } from "../store";
import { Identifiers } from "./pages/Identifiers";
import { OperationType } from "./globals/types";

jest.mock("../core/agent/agent", () => ({
  Agent: {
    agent: {
      start: jest.fn(),
      initDatabaseConnection: jest.fn(),
      getBranAndMnemonic: jest.fn(() =>
        Promise.resolve({
          bran: "",
          mnemonic: "",
        })
      ),
      identifiers: {
        getIdentifiers: jest.fn().mockResolvedValue([]),
        syncKeriaIdentifiers: jest.fn(),
      },
      connections: {
        getConnections: jest.fn().mockResolvedValue([]),
        getMultisigConnections: jest.fn().mockResolvedValue([]),
        onConnectionStateChanged: jest.fn(),
        getConnectionShortDetails: jest.fn(),
        isConnectionRequestSent: jest.fn(),
        isConnectionResponseReceived: jest.fn(),
        isConnectionRequestReceived: jest.fn(),
        isConnectionResponseSent: jest.fn(),
        isConnectionConnected: jest.fn(),
        getConnectionShortDetailById: jest.fn(),
        getUnhandledConnections: jest.fn(),
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
        onAcdcStateChanged: jest.fn(),
        syncACDCs: jest.fn(),
      },
      messages: {
        onBasicMessageStateChanged: jest.fn(),
        pickupMessagesFromMediator: jest.fn(),
      },
      signifyNotifications: {
        pollNotificationsWithCb: jest.fn(),
        pollLongOperationsWithCb: jest.fn(),
        getAllNotifications: jest.fn(),
        stopNotification: jest.fn(),
        startNotification: jest.fn(),
      },
      onKeriaStatusStateChanged: jest.fn(),
      peerConnectionMetadataStorage: {
        getAllPeerConnectionMetadata: jest.fn(),
        getPeerConnectionMetadata: jest.fn(),
      },
      basicStorage: {
        findById: jest.fn(),
      },
      auth: {
        getLoginAttempts: jest.fn(() =>
          Promise.resolve({
            attempts: 0,
            lockedUntil: Date.now(),
          })
        ),
      },
    },
  },
}));

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    set: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
  },
}));

const setStyleMock = jest.fn();
jest.mock("@capacitor/status-bar", () => ({
  ...jest.requireActual("@capacitor/status-bar"),
  StatusBar: {
    setStyle: (params: StyleOptions) => setStyleMock(params),
  },
}));

const lockScreenOrientationMock = jest.fn();
jest.mock("@capacitor/screen-orientation", () => ({
  ...jest.requireActual("@capacitor/status-bar"),
  ScreenOrientation: {
    lock: (params: StyleOptions) => lockScreenOrientationMock(params),
    unlock: () => jest.fn(),
  },
}));

const getPlatformsMock = jest.fn(() => ["android"]);

jest.mock("@ionic/react", () => ({
  ...jest.requireActual("@ionic/react"),
  getPlatforms: () => getPlatformsMock(),
}));

const mockStore = configureStore();
const dispatchMock = jest.fn();
const initialState = {
  stateCache: {
    routes: [TabsRoutePath.IDENTIFIERS],
    authentication: {
      loggedIn: true,
      userName: "",
      time: Date.now(),
      passcodeIsSet: true,
      loginAttempt: {
        attempts: 0,
        lockedUntil: Date.now(),
      },
    },
  },
  connectionsCache: {
    connections: [],
  },
  identifiersCache: {
    identifiers: [],
    favourites: [],
  },
};

const storeMocked = {
  ...mockStore(initialState),
  dispatch: dispatchMock,
};

describe("App", () => {
  test("Mobile header hidden when app not in preview mode", async () => {
    const { queryByTestId } = render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    await waitFor(() => {
      expect(queryByTestId("mobile-preview-header")).not.toBeInTheDocument();
      expect(queryByTestId("offline-page")).toBe(null);
    });
  });

  test.skip("Force status bar style is dark mode on ios", async () => {
    getPlatformsMock.mockImplementationOnce(() => ["ios"]);

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    await waitFor(() => {
      expect(setStyleMock).toBeCalledWith({
        style: Style.Light,
      });
    });
  });

  test("Should not force status bar style is dark mode on android or browser", async () => {
    getPlatformsMock.mockImplementationOnce(() => ["android", "mobileweb"]);

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    await waitFor(() => {
      expect(setStyleMock).toBeCalledTimes(0);
    });
  });

  test("Should lock screen orientation to portrait mode", async () => {
    getPlatformsMock.mockImplementationOnce(() => ["android"]);

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    await waitFor(() => {
      expect(lockScreenOrientationMock).toBeCalledTimes(1);
      expect(lockScreenOrientationMock).toBeCalledWith({
        orientation: "portrait",
      });
    });
  });

  test("Should show offline page", async () => {
    const initialState = {
      seedPhraseCache: {
        seedPhrase: "",
        bran: "",
      },
      ssiAgentCache: {
        bootUrl: "",
        connectUrl: "",
      },
      stateCache: {
        isOnline: false,
        initialized: true,
        routes: [{ path: "/route1" }, { path: "/route2" }, { path: "/route3" }],
        authentication: {
          passcodeIsSet: true,
          seedPhraseIsSet: false,
          passwordIsSet: false,
          passwordIsSkipped: true,
          loggedIn: false,
          userName: "",
          time: 0,
          ssiAgentIsSet: false,
          recoveryWalletProgress: false,
          loginAttempt: {
            attempts: 0,
            lockedUntil: Date.now(),
          },
        },
        currentOperation: OperationType.IDLE,
        queueIncomingRequest: {
          isProcessing: false,
          queues: [],
          isPaused: false,
        },
      },
      identifiersCache: {
        identifiers: [],
        favourites: [],
        multiSigGroup: {
          groupId: "",
          connections: [],
        },
      },
      credsCache: { creds: [], favourites: [] },
      credsArchivedCache: { creds: [] },
      connectionsCache: {
        connections: {},
        multisigConnections: {},
      },
      walletConnectionsCache: {
        walletConnections: [],
        connectedWallet: null,
        pendingConnection: null,
      },
      identifierViewTypeCacheCache: {
        viewType: null,
        favouriteIndex: 0,
      },
      biometricsCache: {
        enabled: false,
      },
      notificationsCache: {
        notifications: [],
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <App />
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId("offline-page")).toBeVisible();
    });
  });

  test.skip("It renders SetUserName modal", async () => {
    const { queryByTestId } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[TabsRoutePath.IDENTIFIERS]}>
          <Route
            path={TabsRoutePath.IDENTIFIERS}
            component={Identifiers}
          />
        </MemoryRouter>
      </Provider>
    );
    await waitFor(() => {
      expect(queryByTestId("set-user-name")).toBeInTheDocument();
    });
  });
});
