import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { ConnectionShortDetails } from "../../../core/agent/agent.types";
import { ConnectionsCacheState } from "./connectionsCache.types";
const initialState: ConnectionsCacheState = {
  connections: {},
  multisigConnections: {},
};
const connectionsCacheSlice = createSlice({
  name: "connectionsCache",
  initialState,
  reducers: {
    setConnectionsCache: (
      state,
      action: PayloadAction<ConnectionShortDetails[]>
    ) => {
      const newConnections = action.payload.reduce(
        (acc: { [key: string]: ConnectionShortDetails }, connection) => {
          acc[connection.id] = connection;
          return acc;
        },
        {}
      );

      state.connections = newConnections;
    },

    updateOrAddConnectionCache: (
      state,
      action: PayloadAction<ConnectionShortDetails>
    ) => {
      state.connections = {
        ...state.connections,
        [action.payload.id]: action.payload,
      };
    },

    removeConnectionCache: (state, action: PayloadAction<string>) => {
      delete state.connections[action.payload];
    },

    setMultisigConnectionsCache: (
      state,
      action: PayloadAction<ConnectionShortDetails[]>
    ) => {
      const multisigConnection = action.payload.reduce(
        (acc: { [key: string]: ConnectionShortDetails }, connection) => {
          acc[connection.id] = connection;
          return acc;
        },
        {}
      );

      state.multisigConnections = multisigConnection;
    },

    updateOrAddMultisigConnectionCache: (
      state,
      action: PayloadAction<ConnectionShortDetails>
    ) => {
      state.multisigConnections = {
        ...state.multisigConnections,
        [action.payload.id]: action.payload,
      };
    },

    setOpenConnectionId: (state, action: PayloadAction<string | undefined>) => {
      state.openConnectionId = action.payload;
    },
    setMissingAliasUrl: (state, action: PayloadAction<string | undefined>) => {
      state.missingAliasUrl = action.payload;
    },
  },
});

export { initialState, connectionsCacheSlice };

export const {
  setConnectionsCache,
  setMultisigConnectionsCache,
  updateOrAddConnectionCache,
  removeConnectionCache,
  updateOrAddMultisigConnectionCache,
  setOpenConnectionId,
  setMissingAliasUrl,
} = connectionsCacheSlice.actions;

const getConnectionsCache = (state: RootState) =>
  state.connectionsCache.connections;

const getMultisigConnectionsCache = (state: RootState) =>
  state.connectionsCache.multisigConnections;

const getOpenConnectionId = (state: RootState) =>
  state.connectionsCache.openConnectionId;

const getMissingAliasUrl = (state: RootState) =>
  state.connectionsCache.missingAliasUrl;

export {
  getConnectionsCache,
  getMultisigConnectionsCache,
  getOpenConnectionId,
  getMissingAliasUrl,
};
