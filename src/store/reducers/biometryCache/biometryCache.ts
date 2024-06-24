import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { BiometricsCacheProps } from "./biometryCache.types";

const initialState: BiometricsCacheProps = {
  enabled: false,
};

const biometryCacheSlice = createSlice({
  name: "biometryCache",
  initialState,
  reducers: {
    setEnableBiometricsCache: (state, action: PayloadAction<boolean>) => {
      state.enabled = action.payload;
    },
  },
});

const { setEnableBiometricsCache } = biometryCacheSlice.actions;

const getBiometricsCacheCache = (state: RootState) => state.biometryCache;

export {
  initialState,
  setEnableBiometricsCache,
  getBiometricsCacheCache,
  biometryCacheSlice,
};
