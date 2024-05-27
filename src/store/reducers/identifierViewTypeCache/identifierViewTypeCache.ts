import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { IdentifierViewTypeCacheProps } from "./identifierViewTypeCache.types";
import { CardListViewType } from "../../../ui/components/SwitchCardView";

const initialState: IdentifierViewTypeCacheProps = {
  viewType: null,
};

const identifierViewTypeCacheSlice = createSlice({
  name: "identifierViewTypeCacheSlice",
  initialState,
  reducers: {
    setViewTypeCache: (state, action: PayloadAction<CardListViewType>) => {
      state.viewType = action.payload;
    },
  },
});

const { setViewTypeCache } = identifierViewTypeCacheSlice.actions;

const getIdentifierViewTypeCacheCache = (state: RootState) =>
  state.identifierViewTypeCacheCache;

export {
  initialState,
  setViewTypeCache,
  getIdentifierViewTypeCacheCache,
  identifierViewTypeCacheSlice,
};
