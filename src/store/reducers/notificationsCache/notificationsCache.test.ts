import { PayloadAction } from "@reduxjs/toolkit";
import {
  deleteNotification,
  getNotificationDetailCache,
  getNotificationsCache,
  notificationsCacheSlice,
  setNotificationDetailCache,
  setNotificationsCache,
  setReadedNotification,
} from "./notificationsCache";
import { RootState } from "../../index";
import { KeriaNotification } from "../../../core/agent/agent.types";
import { OperationType } from "../../../ui/globals/types";
import { NotificationDetailCacheState } from "./notificationCache.types";

const notification = {
  id: "AL3XmFY8BM9F604qmV-l9b0YMZNvshHG7X6CveMWKMmG",
  createdAt: "2024-06-25T12:38:36.988Z",
  a: {
    r: "/exn/ipex/grant",
    d: "EMT02ZHUhpnr4gFFk104B-pLwb2bJC8aip2VYmbPztnk",
    m: "",
  },
  connectionId: "EMrT7qX0FIMenQoe5pJLahxz_rheks1uIviGW8ch8pfB",
  read: true,
};

describe("Notifications cache", () => {
  const initialState = {
    notifications: [],
    notificationDetailCache: null,
  };
  it("should return the initial state", () => {
    expect(
      notificationsCacheSlice.reducer(undefined, {} as PayloadAction)
    ).toEqual(initialState);
  });

  it("should handle setReadedNotification", () => {
    const initialState = {
      notifications: [notification],
    };

    const newState = notificationsCacheSlice.reducer(
      initialState,
      setReadedNotification({
        id: "AL3XmFY8BM9F604qmV-l9b0YMZNvshHG7X6CveMWKMmG",
        read: false,
      })
    );

    expect(newState.notifications).toEqual([
      {
        id: "AL3XmFY8BM9F604qmV-l9b0YMZNvshHG7X6CveMWKMmG",
        createdAt: "2024-06-25T12:38:36.988Z",
        a: {
          r: "/exn/ipex/grant",
          d: "EMT02ZHUhpnr4gFFk104B-pLwb2bJC8aip2VYmbPztnk",
          m: "",
        },
        connectionId: "EMrT7qX0FIMenQoe5pJLahxz_rheks1uIviGW8ch8pfB",
        read: false,
      },
    ]);
  });

  it("should handle deleteNotification", () => {
    const initialState = {
      notifications: [notification],
    };

    const newState = notificationsCacheSlice.reducer(
      initialState,
      deleteNotification(notification)
    );

    expect(newState.notifications).toEqual([]);
  });

  it("should handle setNotificationsCache", () => {
    const notifications: KeriaNotification[] = [
      {
        id: "AL3XmFY8BM9F604qmV-l9b0YMZNvshHG7X6CveMWKMmG",
        createdAt: "2024-06-25T12:38:36.988Z",
        a: {
          r: "/exn/ipex/grant",
          d: "EMT02ZHUhpnr4gFFk104B-pLwb2bJC8aip2VYmbPztnk",
          m: "",
        },
        connectionId: "EMrT7qX0FIMenQoe5pJLahxz_rheks1uIviGW8ch8pfB",
        read: true,
      },
    ];
    const newState = notificationsCacheSlice.reducer(
      initialState,
      setNotificationsCache(notifications)
    );
    expect(newState.notifications).toEqual(notifications);
  });

  it("should handle setNotificationDetailCache", () => {
    const notificationDetailCache: NotificationDetailCacheState = {
      notificationId: "test-id",
      viewCred: "test-cred",
      step: 0,
    };
    const newState = notificationsCacheSlice.reducer(
      initialState,
      setNotificationDetailCache(notificationDetailCache)
    );
    expect(newState.notificationDetailCache).toEqual(notificationDetailCache);
  });

  it("should return the notifications cache from RootState", () => {
    const state: RootState = {
      stateCache: {
        isOnline: true,
        initialized: true,
        routes: [],
        authentication: {
          loggedIn: false,
          userName: "",
          time: 0,
          passcodeIsSet: false,
          seedPhraseIsSet: false,
          passwordIsSet: false,
          passwordIsSkipped: true,
          ssiAgentIsSet: false,
          recoveryWalletProgress: false,
        },
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
      identifierViewTypeCacheCache: {
        viewType: null,
        favouriteIndex: 0,
      },
      biometricsCache: {
        enabled: false,
      },
      ssiAgentCache: {
        bootUrl: "",
        connectUrl: "",
      },
      notificationsCache: {
        notifications: [
          {
            id: "AL3XmFY8BM9F604qmV-l9b0YMZNvshHG7X6CveMWKMmG",
            createdAt: "2024-06-25T12:38:36.988Z",
            a: {
              r: "/exn/ipex/grant",
              d: "EMT02ZHUhpnr4gFFk104B-pLwb2bJC8aip2VYmbPztnk",
              m: "",
            },
            connectionId: "EMrT7qX0FIMenQoe5pJLahxz_rheks1uIviGW8ch8pfB",
            read: true,
          },
        ],
      },
    };
    const notificationsCache = getNotificationsCache(state);
    expect(notificationsCache).toEqual(state.notificationsCache.notifications);
  });

  it("should return the notification detail cache from RootState", () => {
    const state: RootState = {
      stateCache: {
        initialized: true,
        isOnline: true,
        routes: [],
        authentication: {
          loggedIn: false,
          userName: "",
          time: 0,
          passcodeIsSet: false,
          seedPhraseIsSet: false,
          passwordIsSet: false,
          passwordIsSkipped: true,
          ssiAgentIsSet: false,
          recoveryWalletProgress: false,
        },
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
      identifierViewTypeCacheCache: {
        viewType: null,
        favouriteIndex: 0,
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
        notificationDetailCache: {
          notificationId: "test-id",
          viewCred: "test-cred",
          step: 0,
        },
      },
    };
    const notificationsCache = getNotificationDetailCache(state);
    expect(notificationsCache).toEqual(
      state.notificationsCache.notificationDetailCache
    );
  });
});
