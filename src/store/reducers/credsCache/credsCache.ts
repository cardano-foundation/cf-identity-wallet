import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { CredentialShortDetails } from "../../../core/agent/agent.types";
import { FavouriteIdentifier } from "../identitiesCache/identitiesCache.types";

const initialState: {
  creds: CredentialShortDetails[];
  favourites: FavouriteIdentifier[];
} = {
  creds: [],
  favourites: [],
};
const credsCacheSlice = createSlice({
  name: "credsCache",
  initialState,
  reducers: {
    setCredsCache: (state, action: PayloadAction<CredentialShortDetails[]>) => {
      state.creds = action.payload;
    },
    updateOrAddCredsCache: (
      state,
      action: PayloadAction<CredentialShortDetails>
    ) => {
      const creds = state.creds.filter((cred) => cred.id !== action.payload.id);
      state.creds = [...creds, action.payload];
    },
    setFavouritesCredsCache: (
      state,
      action: PayloadAction<FavouriteIdentifier[]>
    ) => {
      state.favourites = action.payload;
    },
    addFavouritesCredsCache: (
      state,
      action: PayloadAction<FavouriteIdentifier>
    ) => {
      if (state.favourites.some((fav) => fav.id === action.payload.id)) return;
      state.favourites = [action.payload, ...state.favourites];
    },
    removeFavouritesCredsCache: (state, action: PayloadAction<string>) => {
      state.favourites = state.favourites.filter(
        (fav) => fav.id !== action.payload
      );
    },
  },
});

export { initialState, credsCacheSlice };

export const {
  setCredsCache,
  updateOrAddCredsCache,
  setFavouritesCredsCache,
  addFavouritesCredsCache,
  removeFavouritesCredsCache,
} = credsCacheSlice.actions;

const getCredsCache = (state: RootState) => state.credsCache.creds;
const getFavouritesCredsCache = (state: RootState) =>
  state.credsCache.favourites;

export { getCredsCache, getFavouritesCredsCache };
