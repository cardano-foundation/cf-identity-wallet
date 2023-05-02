import { PayloadAction } from "@reduxjs/toolkit";

import {
  clearSeedPhraseCache,
  getSeedPhraseCache,
  initialState,
  SeedPhraseCacheSlice,
  setSeedPhraseCache,
} from "./SeedPhraseCache";
import { RootState } from "../../index";

describe("SeedPhraseCache", () => {
  test("should return the initial state on first run", () => {
    expect(
      SeedPhraseCacheSlice.reducer(undefined, {} as PayloadAction)
    ).toEqual(initialState);
  });

  test("should set the seed phrase cache", () => {
    const seedPhrase = "test seed phrase";
    const action = setSeedPhraseCache(seedPhrase);
    const nextState = SeedPhraseCacheSlice.reducer(initialState, action);

    expect(nextState.seedPhrase).toEqual(seedPhrase);
    expect(nextState).not.toBe(initialState);

    const rootState = { seedPhraseCache: nextState } as RootState;
    expect(getSeedPhraseCache(rootState)).toEqual(nextState);
  });

  test("should clear the seed phrase cache", () => {
    const seedPhrase = "test seed phrase";

    const setAction = setSeedPhraseCache(seedPhrase);
    let nextState = SeedPhraseCacheSlice.reducer(initialState, setAction);
    expect(nextState.seedPhrase).toEqual(seedPhrase);

    const clearAction = clearSeedPhraseCache();
    nextState = SeedPhraseCacheSlice.reducer(initialState, clearAction);
    expect(nextState).toBe(initialState);

    const rootState = { seedPhraseCache: nextState } as RootState;
    expect(getSeedPhraseCache(rootState)).toEqual(initialState);
  });
});
