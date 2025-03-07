import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { config } from "../../config";
import {
  Contact,
  Credential,
} from "../../pages/Connections/components/ConnectionsTable/ConnectionsTable.types";

interface ConnectionsState {
  contacts: Contact[];
  credentials: Credential[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ConnectionsState = {
  contacts: [],
  credentials: [],
  status: "idle",
  error: null,
};

export const fetchContacts = createAsyncThunk(
  "connections/fetchContacts",
  async () => {
    const response = await axios.get(
      `${config.endpoint}${config.path.contacts}`
    );
    return response.data.data;
  }
);

export const fetchContactCredentials = createAsyncThunk(
  "connections/fetchContactCredentials",
  async (contactId: string) => {
    const response = await axios.get(
      `${config.endpoint}${config.path.contactCredentials}`,
      {
        params: { contactId },
      }
    );
    return { contactId, credentials: response.data.data };
  }
);

const connectionsSlice = createSlice({
  name: "connections",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.contacts = action.payload;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(fetchContactCredentials.fulfilled, (state, action) => {
        const { contactId, credentials } = action.payload;
        state.credentials = state.credentials.concat(
          credentials.map((cred: Credential) => ({ ...cred, contactId }))
        );
      });
  },
});

export default connectionsSlice.reducer;
