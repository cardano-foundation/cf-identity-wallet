import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IdentityShortDetails } from "../../../core/aries/ariesAgent.types";
import { RootState } from "../../index";
const initialState: { identities: IdentityShortDetails[] } = {
  identities: [],
};
const identitiesCacheSlice = createSlice({
  name: "identitiesCache",
  initialState,
  reducers: {
    setIdentitiesCache: (state, action: PayloadAction<IdentityShortDetails[]>) => {
      state.identities = action.payload;
    },
  },
});

export { initialState, identitiesCacheSlice };

export const { setIdentitiesCache } = identitiesCacheSlice.actions;

const getIdentitiesCache = (state: RootState) => state.identitiesCache.identities;

export { getIdentitiesCache };
