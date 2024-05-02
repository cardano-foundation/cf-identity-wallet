import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IdentifierShortDetails } from "../../../core/agent/services/identifierService.types";
import { RootState } from "../../index";
import { FavouriteIdentifier, MultiSigGroup } from "./identifiersCache.types";

const initialState: {
  identifiers: IdentifierShortDetails[];
  favourites: FavouriteIdentifier[];
  multiSigGroups: MultiSigGroup[];
} = {
  identifiers: [],
  favourites: [],
  multiSigGroups: [],
};
const identifiersCacheSlice = createSlice({
  name: "identifiersCache",
  initialState,
  reducers: {
    setIdentifiersCache: (
      state,
      action: PayloadAction<IdentifierShortDetails[]>
    ) => {
      state.identifiers = action.payload;
    },
    setFavouritesIdentifiersCache: (
      state,
      action: PayloadAction<FavouriteIdentifier[]>
    ) => {
      state.favourites = action.payload;
    },
    addFavouriteIdentifierCache: (
      state,
      action: PayloadAction<FavouriteIdentifier>
    ) => {
      if (state.favourites.some((fav) => fav.id === action.payload.id)) return;
      state.favourites = [action.payload, ...state.favourites];
    },
    removeFavouriteIdentifierCache: (state, action: PayloadAction<string>) => {
      state.favourites = state.favourites.filter(
        (fav) => fav.id !== action.payload
      );
    },
    setMultiSigGroupsCache: (state, action: PayloadAction<MultiSigGroup[]>) => {
      state.multiSigGroups = action.payload;
    },
  },
});

export { initialState, identifiersCacheSlice };

export const {
  setIdentifiersCache,
  setFavouritesIdentifiersCache,
  addFavouriteIdentifierCache,
  removeFavouriteIdentifierCache,
  setMultiSigGroupsCache,
} = identifiersCacheSlice.actions;

const getIdentifiersCache = (state: RootState) =>
  state.identifiersCache.identifiers;

const getFavouritesIdentifiersCache = (state: RootState) =>
  state.identifiersCache.favourites;

const getMultiSigGroupsCache = (state: RootState) =>
  state.identifiersCache.multiSigGroups;

export {
  getIdentifiersCache,
  getFavouritesIdentifiersCache,
  getMultiSigGroupsCache,
};
