import { PayloadAction } from "@reduxjs/toolkit";
import {
  biometricsCacheSlice,
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
});
