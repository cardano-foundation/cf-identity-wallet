import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";

const initialState: {
  creds: CredentialShortDetails[];
} = {
  creds: [],
};
const credsArchivedCacheSlice = createSlice({
  name: "credsArchivedCache",
  initialState,
  reducers: {
    setCredsArchivedCache: (
      state,
      action: PayloadAction<CredentialShortDetails[]>
    ) => {
      state.creds = action.payload;
    },
  },
});

export { initialState, credsArchivedCacheSlice };

export const { setCredsArchivedCache } = credsArchivedCacheSlice.actions;

const getCredsArchivedCache = (state: RootState) =>
  state.credsArchivedCache.creds;

export { getCredsArchivedCache };
