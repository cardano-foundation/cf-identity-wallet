import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { ViewTypeCacheProps } from "./viewTypeCache.types";
import { CardListViewType } from "../../../ui/components/SwitchCardView";

const initialState: ViewTypeCacheProps = {
  identifier: {
    viewType: null,
    favouriteIndex: 0,
  },
  credential: {
    viewType: null,
    favouriteIndex: 0,
  },
};

const viewTypeCacheSlice = createSlice({
  name: "viewTypeCacheSlice",
  initialState,
  reducers: {
    setIdentifierViewTypeCache: (
      state,
      action: PayloadAction<CardListViewType>
    ) => {
      state.identifier.viewType = action.payload;
    },
    setIdentifierFavouriteIndex: (state, action: PayloadAction<number>) => {
      state.identifier.favouriteIndex = action.payload;
    },
    setCredentialViewTypeCache: (
      state,
      action: PayloadAction<CardListViewType>
    ) => {
      state.credential.viewType = action.payload;
    },
    setCredentialFavouriteIndex: (state, action: PayloadAction<number>) => {
      state.credential.favouriteIndex = action.payload;
    },
    clearViewTypeCache: () => initialState,
  },
});

export const {
  setIdentifierFavouriteIndex,
  setIdentifierViewTypeCache,
  setCredentialFavouriteIndex,
  setCredentialViewTypeCache,
  clearViewTypeCache,
} = viewTypeCacheSlice.actions;

const getIdentifierViewTypeCache = (state: RootState) =>
  state.viewTypeCache.identifier;

const getIdentifierFavouriteIndex = (state: RootState) =>
  state.viewTypeCache.identifier.favouriteIndex;

const getCredentialViewTypeCache = (state: RootState) =>
  state.viewTypeCache.credential;

const getCredentialFavouriteIndex = (state: RootState) =>
  state.viewTypeCache.credential.favouriteIndex;

export {
  initialState,
  getCredentialViewTypeCache,
  getCredentialFavouriteIndex,
  getIdentifierFavouriteIndex,
  getIdentifierViewTypeCache,
  viewTypeCacheSlice,
};
