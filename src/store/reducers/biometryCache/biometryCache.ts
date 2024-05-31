import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { BiometryCacheProps } from "./biometryCache.types";

const initialState: BiometryCacheProps = {
  enabled: false,
};

const biometryCacheSlice = createSlice({
  name: "biometryCache",
  initialState,
  reducers: {
    setEnableBiometryCache: (state, action: PayloadAction<boolean>) => {
      state.enabled = action.payload;
    },
  },
});

const { setEnableBiometryCache } = biometryCacheSlice.actions;

const getBiometryCacheCache = (state: RootState) => state.biometryCache;

export {
  initialState,
  setEnableBiometryCache,
  getBiometryCacheCache,
  biometryCacheSlice,
};
