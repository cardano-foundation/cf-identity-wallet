import { PayloadAction } from "@reduxjs/toolkit";
import {
  getNotificationsCache,
  notificationsCacheSlice,
  setNotificationsCache,
} from "./notificationsCache";
import { RootState } from "../../index";
import { NotificationResult } from "../../../core/agent/agent.types";
import { OperationType } from "../../../ui/globals/types";

describe("Notifications cache", () => {
  const initialState = {
    notifications: [],
  };
  it("should return the initial state", () => {
    expect(
      notificationsCacheSlice.reducer(undefined, {} as PayloadAction)
    ).toEqual(initialState);
  });

  it("should handle setNotificationsCache", () => {
    const notifications: NotificationResult[] = [
      {
        id: "AL3XmFY8BM9F604qmV-l9b0YMZNvshHG7X6CveMWKMmG",
        createdAt: "2024-06-25T12:38:36.988Z",
        a: {
          r: "/exn/ipex/grant",
          d: "EMT02ZHUhpnr4gFFk104B-pLwb2bJC8aip2VYmbPztnk",
          m: "",
        },
        connectionId: "EMrT7qX0FIMenQoe5pJLahxz_rheks1uIviGW8ch8pfB",
        multisigId: "EMrT7qX0FIMenQoe5pJLahxz_rheks1uIviGW8ch8pfB",
      },
    ];
    const newState = notificationsCacheSlice.reducer(
      initialState,
      setNotificationsCache(notifications)
    );
    expect(newState.notifications).toEqual(notifications);
  });

  it("should return the notifications cache from RootState", () => {
    const state: RootState = {
      stateCache: {
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
        connections: [],
      },
      walletConnectionsCache: {
        walletConnections: [],
        connectedWallet: null,
        pendingConnection: null,
      },
      identifierViewTypeCacheCache: {
        viewType: null,
      },
      biometryCache: {
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
            multisigId: "EMrT7qX0FIMenQoe5pJLahxz_rheks1uIviGW8ch8pfB",
          },
        ],
      },
    };
    const notificationsCache = getNotificationsCache(state);
    expect(notificationsCache).toEqual(state.notificationsCache.notifications);
  });
});
