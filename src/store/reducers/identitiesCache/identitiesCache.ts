import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IdentifierShortDetails } from "../../../core/agent/agent.types";
import { RootState } from "../../index";
import { FavouriteIdentifier } from "./identitiesCache.types";

const initialState: {
  identities: IdentifierShortDetails[];
  favourites: FavouriteIdentifier[];
} = {
  identities: [],
  favourites: [],
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
    setFavouritesIdentitiesCache: (
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
  },
});

export { initialState, identitiesCacheSlice };

export const {
  setIdentitiesCache,
  setFavouritesIdentitiesCache,
  addFavouriteIdentifierCache,
  removeFavouriteIdentifierCache,
} = identitiesCacheSlice.actions;

const getIdentitiesCache = (state: RootState) =>
  state.identitiesCache.identities;

const getFavouritesIdentitiesCache = (state: RootState) =>
  state.identitiesCache.favourites;

export { getIdentitiesCache, getFavouritesIdentitiesCache };
