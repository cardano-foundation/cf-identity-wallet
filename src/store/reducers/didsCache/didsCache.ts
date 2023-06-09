import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CardsStackProps } from "../../../ui/components/CardsStack/CardsStack.types";
import { RootState } from "../../index";
const initialState: { dids: CardsStackProps[] } = {
  dids: [],
};
const didsCacheSlice = createSlice({
  name: "didsCache",
  initialState,
  reducers: {
    setDidsCache: (state, action: PayloadAction<CardsStackProps[]>) => {
      state.dids = action.payload;
    },
  },
});

export { initialState, didsCacheSlice };

export const { setDidsCache } = didsCacheSlice.actions;

const getDidsCache = (state: RootState) => state.didsCache.dids;

export { getDidsCache };
