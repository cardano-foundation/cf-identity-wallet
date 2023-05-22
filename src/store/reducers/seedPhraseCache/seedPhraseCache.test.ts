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
    const seedPhrase160 = "test seed phrase 160";
    const seedPhrase256 = "test seed phrase 256";
    const action = setSeedPhraseCache({seedPhrase160, seedPhrase256});
    const nextState = seedPhraseCacheSlice.reducer(initialState, action);

    expect(nextState.seedPhrase160).toEqual(seedPhrase160);
    expect(nextState.seedPhrase256).toEqual(seedPhrase256);
    expect(nextState).not.toBe(initialState);

    const rootState = { seedPhraseCache: nextState } as RootState;
    expect(getSeedPhraseCache(rootState)).toEqual(nextState);
  });

  test("should clear the seed phrase cache", () => {
    const seedPhrase160 = "test seed phrase 160";
    const seedPhrase256 = "test seed phrase 256";

    const action = setSeedPhraseCache({seedPhrase160, seedPhrase256});
    let nextState = seedPhraseCacheSlice.reducer(initialState, action);
    expect(nextState.seedPhrase160).toEqual(seedPhrase160);
    expect(nextState.seedPhrase256).toEqual(seedPhrase256);

    const clearAction = clearSeedPhraseCache();
    nextState = seedPhraseCacheSlice.reducer(initialState, clearAction);
    expect(nextState).toBe(initialState);

    const rootState = { seedPhraseCache: nextState } as RootState;
    expect(getSeedPhraseCache(rootState)).toEqual(initialState);
  });
});
