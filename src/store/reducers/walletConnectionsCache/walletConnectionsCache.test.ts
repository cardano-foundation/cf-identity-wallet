import { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import {
  getConnectedWallet,
  getPendingConnection,
  getWalletConnectionsCache,
  setConnectedWallet,
  setPendingConnections,
  setWalletConnectionsCache,
  walletConnectionsCacheSlice,
} from "./walletConnectionsCache";
import {
  ConnectionData,
  WalletConnectState,
} from "./walletConnectionsCache.types";

describe("walletConnectionsCacheSlice", () => {
  const initialState: WalletConnectState = {
    walletConnections: [],
    connectedWallet: null,
    pendingConnection: null,
  };

  it("should return the initial state", () => {
    expect(
      walletConnectionsCacheSlice.reducer(undefined, {} as PayloadAction)
    ).toEqual(initialState);
  });

  it("should handle setWalletConnectionsCache", () => {
    const connections: ConnectionData[] = [
      {
        id: 2,
        name: "Wallet name #2",
        owner: "Yoroi",
        url: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
      },
    ];
    const newState = walletConnectionsCacheSlice.reducer(
      initialState,
      setWalletConnectionsCache(connections)
    );
    expect(newState.walletConnections).toEqual(connections);
  });
  it("should handle setConnectedWallet", () => {
    const connection: ConnectionData = {
      id: 2,
      name: "Wallet name #2",
      owner: "Yoroi",
      url: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
    };
    const newState = walletConnectionsCacheSlice.reducer(
      initialState,
      setConnectedWallet(connection)
    );
    expect(newState.connectedWallet).toEqual(connection);
  });
  it("should handle setPendingConnection", () => {
    const connection: ConnectionData = {
      id: 2,
      name: "Wallet name #2",
      owner: "Yoroi",
      url: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
    };
    const newState = walletConnectionsCacheSlice.reducer(
      initialState,
      setPendingConnections(connection)
    );
    expect(newState.pendingConnection).toEqual(connection);
  });
});

describe("Get wallet connections cache", () => {
  it("should return the wallet connetions cache from RootState", () => {
    const state = {
      walletConnectionsCache: {
        walletConnections: [
          {
            id: 1,
            name: "Wallet name #1",
            owner: "Nami",
            image: "",
            url: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
          },
          {
            id: 2,
            name: "Wallet name #2",
            owner: "Yoroi",
            url: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
          },
        ],
      },
    } as RootState;
    const connectionCache = getWalletConnectionsCache(state);
    expect(connectionCache).toEqual(
      state.walletConnectionsCache.walletConnections
    );
  });

  it("should return connected wallet from RootState", () => {
    const state = {
      walletConnectionsCache: {
        connectedWallet: {
          id: 1,
          name: "Wallet name #1",
          owner: "Nami",
          image: "",
          url: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
        },
      },
    } as RootState;
    const connectionCache = getConnectedWallet(state);
    expect(connectionCache).toEqual(
      state.walletConnectionsCache.connectedWallet
    );
  });
  it("should return pending connection from RootState", () => {
    const state = {
      walletConnectionsCache: {
        pendingConnection: {
          id: 1,
          name: "Wallet name #1",
          owner: "Nami",
          image: "",
          url: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
        },
      },
    } as RootState;
    const connectionCache = getPendingConnection(state);
    expect(connectionCache).toEqual(
      state.walletConnectionsCache.pendingConnection
    );
  });
});
