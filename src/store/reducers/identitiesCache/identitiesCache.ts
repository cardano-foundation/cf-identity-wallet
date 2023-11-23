import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IdentifierShortDetails } from "../../../core/agent/agent.types";
import { RootState } from "../../index";
import { FavouriteIdentity } from "./identitiesCache.types";

const initialState: {
  identities: IdentifierShortDetails[];
  favourites: FavouriteIdentity[];
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
      action: PayloadAction<FavouriteIdentity[]>
    ) => {
      state.favourites = action.payload;
    },
    addFavouriteIdentityCache: (
      state,
      action: PayloadAction<FavouriteIdentity>
    ) => {
      if (state.favourites.some((fav) => fav.id === action.payload.id)) return;
      state.favourites = [action.payload, ...state.favourites];
    },
    removeFavouriteIdentityCache: (state, action: PayloadAction<string>) => {
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
  addFavouriteIdentityCache,
  removeFavouriteIdentityCache,
} = identitiesCacheSlice.actions;

const getIdentitiesCache = (state: RootState) =>
  state.identitiesCache.identities;

const getFavouritesIdentitiesCache = (state: RootState) =>
  state.identitiesCache.favourites;

export { getIdentitiesCache, getFavouritesIdentitiesCache };
