import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { CredentialShortDetails } from "../../../core/agent/agent.types";
const initialState: { creds: CredentialShortDetails[] } = {
  creds: [],
};
const credsCacheSlice = createSlice({
  name: "credsCache",
  initialState,
  reducers: {
    setCredsCache: (state, action: PayloadAction<CredentialShortDetails[]>) => {
      state.creds = action.payload;
    },
    updateOrAddCredsCache: (
      state,
      action: PayloadAction<CredentialShortDetails>
    ) => {
      const creds = state.creds.filter((cred) => cred.id !== action.payload.id);
      state.creds = [...creds, action.payload];
    },
  },
});

export { initialState, credsCacheSlice };

export const { setCredsCache, updateOrAddCredsCache } = credsCacheSlice.actions;

const getCredsCache = (state: RootState) => state.credsCache.creds;

export { getCredsCache };
