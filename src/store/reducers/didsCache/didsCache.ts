import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DidProps } from "../../../ui/components/CardsStack/CardsStack.types";
import { RootState } from "../../index";
const initialState: { dids: DidProps[] } = {
  dids: [],
};
const didsCacheSlice = createSlice({
  name: "didsCache",
  initialState,
  reducers: {
    setDidsCache: (state, action: PayloadAction<DidProps[]>) => {
      state.dids = action.payload;
    },
  },
});

export { initialState, didsCacheSlice };

export const { setDidsCache } = didsCacheSlice.actions;

const getDidsCache = (state: RootState) => state.didsCache.dids;

export { getDidsCache };
