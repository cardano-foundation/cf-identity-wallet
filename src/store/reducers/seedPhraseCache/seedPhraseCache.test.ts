import { PayloadAction } from "@reduxjs/toolkit";

import {
  clearSeedPhraseCache,
  getSeedPhraseCache,
  initialState,
  seedPhraseCacheSlice,
  setSeedPhraseCache,
} from "./seedPhraseCache";
import { RootState } from "../../index";

describe("SeedPhraseCache", () => {
  test("should return the initial state on first run", () => {
    expect(
      seedPhraseCacheSlice.reducer(undefined, {} as PayloadAction)
    ).toEqual(initialState);
  });

  test("should set the seed phrase cache", () => {
    const seedPhrase = "test seed phrase 160";
    const bran = "brand";

    const action = setSeedPhraseCache({
      seedPhrase,
      bran,
    });
    const nextState = seedPhraseCacheSlice.reducer(initialState, action);

    expect(nextState.seedPhrase).toEqual(seedPhrase);
    expect(nextState).not.toBe(initialState);

    const rootState = { seedPhraseCache: nextState } as RootState;
    expect(getSeedPhraseCache(rootState)).toEqual(nextState);
  });

  test("should clear the seed phrase cache", () => {
    const seedPhrase = "test seed phrase 160";
    const bran = "bran";

    const action = setSeedPhraseCache({
      seedPhrase,
      bran,
    });
    let nextState = seedPhraseCacheSlice.reducer(initialState, action);
    expect(nextState.seedPhrase).toEqual(seedPhrase);

    const clearAction = clearSeedPhraseCache();
    nextState = seedPhraseCacheSlice.reducer(initialState, clearAction);
    expect(nextState).toBe(initialState);

    const rootState = { seedPhraseCache: nextState } as RootState;
    expect(getSeedPhraseCache(rootState)).toEqual(initialState);
  });
});
