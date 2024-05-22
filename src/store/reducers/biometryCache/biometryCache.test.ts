import { PayloadAction } from "@reduxjs/toolkit";
import { biometryCacheSlice, setEnableBiometryCache } from "./biometryCache";

describe("biometryCache", () => {
  const initialState = {
    enabled: false,
  };
  it("should return the initial state", () => {
    expect(biometryCacheSlice.reducer(undefined, {} as PayloadAction)).toEqual(
      initialState
    );
  });

  it("should handle setEnableBiometryCache", () => {
    const newState = biometryCacheSlice.reducer(
      initialState,
      setEnableBiometryCache(true)
    );
    expect(newState.enabled).toEqual(true);
  });
});
