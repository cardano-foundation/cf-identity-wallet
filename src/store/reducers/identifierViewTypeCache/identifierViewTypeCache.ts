import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { IdentifierViewTypeCacheProps } from "./identifierViewTypeCache.types";
import { CardListViewType } from "../../../ui/components/SwitchCardView";

const initialState: IdentifierViewTypeCacheProps = {
  viewType: null,
  favouriteIndex: 0,
};

const identifierViewTypeCacheSlice = createSlice({
  name: "identifierViewTypeCacheSlice",
  initialState,
  reducers: {
    setViewTypeCache: (state, action: PayloadAction<CardListViewType>) => {
      state.viewType = action.payload;
    },
    setFavouriteIndex: (state, action: PayloadAction<number>) => {
      state.favouriteIndex = action.payload;
    },
  },
});

const { setViewTypeCache, setFavouriteIndex } =
  identifierViewTypeCacheSlice.actions;

const getIdentifierViewTypeCacheCache = (state: RootState) =>
  state.identifierViewTypeCacheCache;

const getIdentifierFavouriteIndex = (state: RootState) =>
  state.identifierViewTypeCacheCache.favouriteIndex;

export {
  initialState,
  setViewTypeCache,
  getIdentifierViewTypeCacheCache,
  identifierViewTypeCacheSlice,
  setFavouriteIndex,
  getIdentifierFavouriteIndex,
};
