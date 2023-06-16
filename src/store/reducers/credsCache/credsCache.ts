import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CardsStackProps } from "../../../ui/components/CardsStack/CardsStack.types";
import { RootState } from "../../index";
const initialState: { creds: CardsStackProps[] } = {
  creds: [],
};
const credsCacheSlice = createSlice({
  name: "credsCache",
  initialState,
  reducers: {
    setCredsCache: (state, action: PayloadAction<CardsStackProps[]>) => {
      state.creds = action.payload;
    },
  },
});

export { initialState, credsCacheSlice };

export const { setCredsCache } = credsCacheSlice.actions;

const getCredsCache = (state: RootState) => state.credsCache.creds;

export { getCredsCache };
