import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { ConnectionShortDetails } from "../../../core/agent/agent.types";
const initialState: {
  connections: { [key: string]: ConnectionShortDetails };
  multisigConnections: { [key: string]: ConnectionShortDetails[] };
} = {
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
      if (!Array.isArray(action.payload) || !action.payload.length) return;

      const newConnections = action.payload.reduce(
        (acc: { [key: string]: ConnectionShortDetails }, connection) => {
          acc[connection.id] = connection;
          return acc;
        },
        {}
      );

      state.connections = { ...newConnections };
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

    setMultisigConnectionsCache: (
      state,
      action: PayloadAction<ConnectionShortDetails[]>
    ) => {
      if (!Array.isArray(action.payload) || !action.payload.length) return;

      const multisigConnection = action.payload.reduce(
        (acc: { [key: string]: ConnectionShortDetails[] }, connection) => {
          if (!connection.groupId) return acc;

          if (!acc[connection.groupId]) {
            acc[connection.groupId] = [];
          }
          acc[connection.groupId].push(connection);
          return acc;
        },
        {}
      );
      state.multisigConnections = multisigConnection;
    },

    addMultisigConnectionCache: (
      state,
      action: PayloadAction<ConnectionShortDetails>
    ) => {
      const { groupId } = action.payload;
      if (!groupId) return;

      if (!state.multisigConnections[groupId]) {
        state.multisigConnections[groupId] = [];
      }

      state.multisigConnections = {
        ...state.multisigConnections,
        [groupId]: [...state.multisigConnections[groupId], action.payload],
      };
    },

    updateMultisigConnectionCache: (
      state,
      action: PayloadAction<ConnectionShortDetails>
    ) => {
      const { groupId } = action.payload;
      if (!groupId) return;

      state.multisigConnections = {
        ...state.multisigConnections,
        [groupId]: state.multisigConnections[groupId]?.map((connection) =>
          connection.id === action.payload?.id ? action.payload : connection
        ),
      };
    },
  },
});

export { initialState, connectionsCacheSlice };

export const {
  setConnectionsCache,
  setMultisigConnectionsCache,
  updateOrAddConnectionCache,
  updateMultisigConnectionCache,
  addMultisigConnectionCache,
} = connectionsCacheSlice.actions;

const getConnectionsCache = (state: RootState) =>
  state.connectionsCache.connections;

const getMultisigConnectionsCache = (state: RootState) =>
  state.connectionsCache.multisigConnections;

export { getConnectionsCache, getMultisigConnectionsCache };
