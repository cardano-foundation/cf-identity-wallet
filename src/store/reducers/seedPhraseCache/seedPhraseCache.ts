import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { SeedPhraseCacheProps } from "./seedPhraseCache.types";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../../ui/globals/constants";
const initialState: SeedPhraseCacheProps = {
  seedPhrase160: "",
  selected: FIFTEEN_WORDS_BIT_LENGTH,
};

const seedPhraseCacheSlice = createSlice({
  name: "seedPhraseCache",
  initialState,
  reducers: {
    setSeedPhraseCache: (
      state,
      action: PayloadAction<SeedPhraseCacheProps>
    ) => {
      state.seedPhrase160 = action.payload.seedPhrase160;
      state.selected = action.payload.selected;
    },
    clearSeedPhraseCache: (state) => {
      state.seedPhrase160 = "";
      state.selected = FIFTEEN_WORDS_BIT_LENGTH;
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
