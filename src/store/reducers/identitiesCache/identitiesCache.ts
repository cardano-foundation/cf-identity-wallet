import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IdentifierShortDetails } from "../../../core/agent/agent.types";
import { RootState } from "../../index";
const initialState: { identities: IdentifierShortDetails[] } = {
  identities: [],
};
const identitiesCacheSlice = createSlice({
  name: "identitiesCache",
  initialState,
  reducers: {
    setIdentitiesCache: (
      state,
      action: PayloadAction<IdentifierShortDetails[]>
    ) => {
      state.identities = action.payload;
    },
  },
});

export { initialState, identitiesCacheSlice };

export const { setIdentitiesCache } = identitiesCacheSlice.actions;

const getIdentitiesCache = (state: RootState) =>
  state.identitiesCache.identities;

export { getIdentitiesCache };
