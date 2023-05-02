import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";

interface SeedPhraseCacheProps {
  seedPhrase: string;
}

const initialState: SeedPhraseCacheProps = {
  seedPhrase: "",
};

const SeedPhraseCacheSlice = createSlice({
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
  SeedPhraseCacheSlice.actions;

const getSeedPhraseCache = (state: RootState) => state.seedPhraseCache;

export type { SeedPhraseCacheProps };

export {
  initialState,
  SeedPhraseCacheSlice,
  setSeedPhraseCache,
  clearSeedPhraseCache,
  getSeedPhraseCache,
};
