import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";

const initialState: {
  creds: CredentialShortDetails[];
} = {
  creds: [],
};
const credsArchivedSlice = createSlice({
  name: "credsArchived",
  initialState,
  reducers: {
    setCredsArchived: (
      state,
      action: PayloadAction<CredentialShortDetails[]>
    ) => {
      state.creds = action.payload;
    },
  },
});

export { initialState, credsArchivedSlice };

export const { setCredsArchived } = credsArchivedSlice.actions;

const getCredsArchived = (state: RootState) => state.credsArchived.creds;

export { getCredsArchived };
