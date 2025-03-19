import { PayloadAction } from "@reduxjs/toolkit";
import {
  biometricsCacheSlice,
  clearBiometricsCache,
  setEnableBiometricsCache,
} from "./biometricsCache";

describe("biometricsCache", () => {
  const initialState = {
    enabled: false,
  };
  it("should return the initial state", () => {
    expect(
      biometricsCacheSlice.reducer(undefined, {} as PayloadAction)
    ).toEqual(initialState);
  });

  it("should handle setEnableBiometricsCache", () => {
    const newState = biometricsCacheSlice.reducer(
      initialState,
      setEnableBiometricsCache(true)
    );
    expect(newState.enabled).toEqual(true);
  });

  it("should handle clearBiometricsCache", () => {
    const newState = biometricsCacheSlice.reducer(
      initialState,
      clearBiometricsCache()
    );
    expect(newState.enabled).toEqual(false);
  });
});
