import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { SeedPhraseCacheProps } from "./seedPhraseCache.types";

const initialState: SeedPhraseCacheProps = {
  seedPhrase: "",
  bran: "",
};

const seedPhraseCacheSlice = createSlice({
  name: "seedPhraseCache",
  initialState,
  reducers: {
    setSeedPhraseCache: (
      state,
      action: PayloadAction<SeedPhraseCacheProps>
    ) => {
      state.seedPhrase = action.payload.seedPhrase;
      state.bran = action.payload.bran;
    },
    clearSeedPhraseCache: (state) => {
      state.seedPhrase = "";
      state.bran = "";
    },
  },
});

const { setSeedPhraseCache, clearSeedPhraseCache } =
  seedPhraseCacheSlice.actions;

const getSeedPhraseCache = (state: RootState) => state.seedPhraseCache;

export type { SeedPhraseCacheProps };

export {
  initialState,
  seedPhraseCacheSlice,
  setSeedPhraseCache,
  clearSeedPhraseCache,
  getSeedPhraseCache,
};
