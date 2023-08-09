import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { ConnectionsProps } from "../../../ui/pages/Connections/Connections.types";
const initialState: { connections: ConnectionsProps[] } = {
  connections: [],
};
const connectionsCacheSlice = createSlice({
  name: "connectionsCache",
  initialState,
  reducers: {
    setConnectionsCache: (state, action: PayloadAction<ConnectionsProps[]>) => {
      state.connections = action.payload;
    },
  },
});

export { initialState, connectionsCacheSlice };

export const { setConnectionsCache } = connectionsCacheSlice.actions;

const getConnectionsCache = (state: RootState) =>
  state.connectionsCache.connections;

export { getConnectionsCache };
