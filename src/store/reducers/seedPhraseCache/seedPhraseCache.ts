import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { SeedPhraseCacheProps } from "./seedPhraseCache.types";
const initialState: SeedPhraseCacheProps = {
  seedPhrase: "",
};

const seedPhraseCacheSlice = createSlice({
  name: "SeedPhraseCache",
  initialState,
  reducers: {
    setSeedPhraseCache: (state, action: PayloadAction<string>) => {
      state.seedPhrase = action.payload;
    },
    clearSeedPhraseCache: (state) => {
      state.seedPhrase = "";
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
