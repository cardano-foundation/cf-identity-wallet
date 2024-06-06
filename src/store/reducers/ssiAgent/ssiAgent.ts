import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { SSIAgentState } from "./ssiAgent.types";

const initialState: SSIAgentState = {
  connectUrl: undefined,
  bootUrl: undefined,
};

const ssiAgentSlice = createSlice({
  name: "ssiAgent",
  initialState,
  reducers: {
    setSSIAgent: (state, action: PayloadAction<SSIAgentState>) => {
      state.connectUrl = action.payload.connectUrl;
      state.bootUrl = action.payload.bootUrl;
    },
    setConnectUrl: (state, action: PayloadAction<string | undefined>) => {
      state.connectUrl = action.payload;
    },
    setBootUrl: (state, action: PayloadAction<string | undefined>) => {
      state.bootUrl = action.payload;
    },
    clearSSIAgent: (state) => {
      state.connectUrl = undefined;
      state.bootUrl = undefined;
    },
  },
});

const { setSSIAgent, clearSSIAgent, setBootUrl, setConnectUrl } =
  ssiAgentSlice.actions;

const getSSIAgent = (state: RootState) => state.ssiAgentCache;

export {
  clearSSIAgent,
  getSSIAgent,
  setSSIAgent,
  ssiAgentSlice,
  setBootUrl,
  setConnectUrl,
};
