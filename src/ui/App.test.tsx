import { Style, StyleOptions } from "@capacitor/status-bar";
import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import Eng_Trans from "../locales/en/en.json";
import { TabsRoutePath } from "../routes/paths";
import { store } from "../store";
import { showGenericError } from "../store/reducers/stateCache";
import { App } from "./App";
import { OperationType } from "./globals/types";

const mockInitDatabase = jest.fn();

jest.mock("../core/agent/agent", () => ({
  Agent: {
    agent: {
      start: jest.fn(),
      setupLocalDependencies: () => mockInitDatabase(),
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
      keriaNotifications: {
        pollNotifications: jest.fn(),
        pollLongOperations: jest.fn(),
        getAllNotifications: jest.fn(),
        stopNotification: jest.fn(),
        startNotification: jest.fn(),
        onNewNotification: jest.fn(),
        onLongOperationComplete: jest.fn(),
        onRemoveNotification: jest.fn(),
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

const isNativeMock = jest.fn(() => false);
jest.mock("@capacitor/core", () => {
  return {
    ...jest.requireActual("@capacitor/core"),
    Capacitor: {
      isNativePlatform: () => isNativeMock(),
    },
  };
});

const addKeyboardEventMock = jest.fn();

jest.mock("@capacitor/keyboard", () => ({
  Keyboard: {
    addListener: (...params: any[]) => addKeyboardEventMock(...params),
    hide: jest.fn()
  },
}));

jest.mock("@capacitor-community/privacy-screen", () => ({
  PrivacyScreen: {
    enable: jest.fn(),
    disable: jest.fn(),
  },
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
    toastMsgs: [],
    showConnections: false,
    currentOperation: OperationType.IDLE,
    queueIncomingRequest: {
      isProcessing: false,
      queues: [],
      isPaused: false,
    },
  },
  seedPhraseCache: {
    seedPhrase: "",
    bran: "",
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
  viewTypeCache: {
    identifier: {
      viewType: null,
      favouriteIndex: 0,
    },
    credential: {
      viewType: null,
      favouriteIndex: 0,
    },
  },
  biometricsCache: {
    enabled: false,
  },
  ssiAgentCache: {
    bootUrl: "",
    connectUrl: "",
  },
  notificationsCache: {
    notifications: [],
  },
};

const storeMocked = {
  ...mockStore(initialState),
  dispatch: dispatchMock,
};

describe("App", () => {
  beforeEach(() => {
    isNativeMock.mockImplementation(() => false);
    mockInitDatabase.mockClear();
    getPlatformsMock.mockImplementation(() => ["android"]);
  });

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

  test("Force status bar style is dark mode on ios", async () => {
    getPlatformsMock.mockImplementation(() => ["ios"]);
    isNativeMock.mockImplementation(() => true);

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
    getPlatformsMock.mockImplementation(() => ["android", "mobileweb"]);
    isNativeMock.mockImplementation(() => true);

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
    getPlatformsMock.mockImplementation(() => ["android"]);
    isNativeMock.mockImplementation(() => true);

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
        routes: [{ path: "/" }, { path: "/route2" }, { path: "/route3" }],
        authentication: {
          passcodeIsSet: true,
          seedPhraseIsSet: false,
          passwordIsSet: false,
          passwordIsSkipped: true,
          loggedIn: false,
          userName: "",
          time: 0,
          ssiAgentIsSet: true,
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
        toastMsgs: [],
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
      viewTypeCache: {
        identifier: {
          viewType: null,
          favouriteIndex: 0,
        },
        credential: {
          viewType: null,
          favouriteIndex: 0,
        },
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

  test("Show error when unhandledrejection event fired", async () => {
    const spy = jest
      .spyOn(window, "addEventListener")
      .mockImplementation((type, listener: any) => {
        if (type === "unhandledrejection") {
          listener({
            preventDefault: jest.fn(),
            promise: Promise.reject(new Error("Failed")),
          });
        }
      });

    render(
      <Provider store={storeMocked}>
        <App />
      </Provider>
    );

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(showGenericError(true));
    });

    spy.mockClear();
  });

  test("Show error when error fired", async () => {
    const spy = jest
      .spyOn(window, "addEventListener")
      .mockImplementation((type, listener: any) => {
        if (type === "error") {
          listener({
            preventDefault: jest.fn(),
            error: new Error("Failed"),
          });
        }
      });

    render(
      <Provider store={storeMocked}>
        <App />
      </Provider>
    );

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(showGenericError(true));
    });

    spy.mockClear();
  });
  test("It renders SetUserName modal", async () => {
    const initialState = {
      stateCache: {
        routes: [{ path: TabsRoutePath.ROOT }],
        authentication: {
          loggedIn: true,
          userName: "",
          time: Date.now(),
          passcodeIsSet: true,
          seedPhraseIsSet: true,
          passwordIsSet: false,
          passwordIsSkipped: true,
          ssiAgentIsSet: true,
          recoveryWalletProgress: false,
          loginAttempt: {
            attempts: 0,
            lockedUntil: Date.now(),
          },
        },
        toastMsgs: [],
        queueIncomingRequest: {
          isProcessing: false,
          queues: [],
          isPaused: false,
        },
      },
      seedPhraseCache: {
        seedPhrase: "",
        bran: "",
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
      viewTypeCache: {
        identifier: {
          viewType: null,
          favouriteIndex: 0,
        },
        credential: {
          viewType: null,
          favouriteIndex: 0,
        },
      },
      biometricsCache: {
        enabled: false,
      },
      ssiAgentCache: {
        bootUrl: "",
        connectUrl: "",
      },
      notificationsCache: {
        notifications: [],
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { getByText } = render(
      <Provider store={storeMocked}>
        <MemoryRouter initialEntries={[TabsRoutePath.IDENTIFIERS]}>
          <App />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(
        getByText(Eng_Trans.inputrequest.title.username)
      ).toBeInTheDocument();
    });
  });
});
