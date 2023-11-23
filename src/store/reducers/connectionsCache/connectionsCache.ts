import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { ConnectionShortDetails } from "../../../core/agent/agent.types";
const initialState: { connections: ConnectionShortDetails[] } = {
  connections: [],
};
const connectionsCacheSlice = createSlice({
  name: "connectionsCache",
  initialState,
  reducers: {
    setConnectionsCache: (
      state,
      action: PayloadAction<ConnectionShortDetails[]>
    ) => {
      state.connections = action.payload;
    },
    updateOrAddConnectionCache: (
      state,
      action: PayloadAction<ConnectionShortDetails>
    ) => {
      const connections = state.connections.filter(
        (connection) => connection.id !== action.payload.id
      );
      state.connections = [...connections, action.payload];
    },
  },
});

export { initialState, connectionsCacheSlice };

export const { setConnectionsCache, updateOrAddConnectionCache } =
  connectionsCacheSlice.actions;

const getConnectionsCache = (state: RootState) =>
  state.connectionsCache.connections;

export { getConnectionsCache };
