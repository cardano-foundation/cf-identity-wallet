import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { RootState } from "../../index";
import { FavouriteIdentifier, MultiSigGroup } from "./identifiersCache.types";

const initialState: {
  identifiers: IdentifierShortDetails[];
  favourites: FavouriteIdentifier[];
  multiSigGroup: MultiSigGroup | undefined;
  openMultiSigId?: string;
  scanGroupId?: string;
} = {
  identifiers: [],
  favourites: [],
  multiSigGroup: undefined,
  openMultiSigId: undefined,
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
    updateOrAddIdentifiersCache: (
      state,
      action: PayloadAction<IdentifierShortDetails>
    ) => {
      const identifiers = state.identifiers.filter(
        (aid) => aid.id !== action.payload.id
      );
      state.identifiers = [...identifiers, action.payload];
    },
    updateIsPending: (
      state,
      action: PayloadAction<Pick<IdentifierShortDetails, "id" | "isPending">>
    ) => {
      const identifier = state.identifiers.find(
        (aid) => aid.id === action.payload.id
      );
      if (identifier) {
        identifier.isPending = action.payload.isPending;
        state.identifiers = [
          ...state.identifiers.filter((aid) => aid.id !== action.payload.id),
          identifier,
        ];
      }
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
    setMultiSigGroupCache: (
      state,
      action: PayloadAction<MultiSigGroup | undefined>
    ) => {
      state.multiSigGroup = action.payload;
    },
    setOpenMultiSigId: (state, action: PayloadAction<string | undefined>) => {
      state.openMultiSigId = action.payload;
    },
    setScanGroupId: (state, action: PayloadAction<string | undefined>) => {
      state.scanGroupId = action.payload;
    },
  },
});

export { initialState, identifiersCacheSlice };

export const {
  setIdentifiersCache,
  setFavouritesIdentifiersCache,
  updateOrAddIdentifiersCache,
  updateIsPending,
  addFavouriteIdentifierCache,
  removeFavouriteIdentifierCache,
  setMultiSigGroupCache,
  setOpenMultiSigId,
  setScanGroupId,
} = identifiersCacheSlice.actions;

const getIdentifiersCache = (state: RootState) =>
  state.identifiersCache.identifiers;

const getFavouritesIdentifiersCache = (state: RootState) =>
  state.identifiersCache.favourites;

const getMultiSigGroupCache = (state: RootState) =>
  state.identifiersCache?.multiSigGroup;

const getOpenMultiSig = (state: RootState) =>
  state.identifiersCache?.openMultiSigId;

const getScanGroupId = (state: RootState) =>
  state.identifiersCache?.scanGroupId;

export {
  getIdentifiersCache,
  getFavouritesIdentifiersCache,
  getMultiSigGroupCache,
  getOpenMultiSig,
  getScanGroupId,
};
