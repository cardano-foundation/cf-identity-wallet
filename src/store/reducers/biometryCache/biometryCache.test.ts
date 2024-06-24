import { PayloadAction } from "@reduxjs/toolkit";
import { biometryCacheSlice, setEnableBiometricsCache } from "./biometryCache";

describe("biometryCache", () => {
  const initialState = {
    enabled: false,
  };
  it("should return the initial state", () => {
    expect(biometryCacheSlice.reducer(undefined, {} as PayloadAction)).toEqual(
      initialState
    );
  });

  it("should handle setEnableBiometricsCache", () => {
    const newState = biometryCacheSlice.reducer(
      initialState,
      setEnableBiometricsCache(true)
    );
    expect(newState.enabled).toEqual(true);
  });
});
