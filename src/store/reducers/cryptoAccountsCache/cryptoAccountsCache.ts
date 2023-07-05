import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { CryptoAccountProps } from "../../../ui/pages/Crypto/Crypto.types";
const initialState: {
  cryptoAccounts: CryptoAccountProps[];
  defaultCryptoAccount: string;
  hideCryptoData: boolean;
} = {
  cryptoAccounts: [],
  defaultCryptoAccount: "",
  hideCryptoData: false,
};
const cryptoAccountsCacheSlice = createSlice({
  name: "cryptoAccountsCache",
  initialState,
  reducers: {
    setCryptoAccountsCache: (
      state,
      action: PayloadAction<CryptoAccountProps[]>
    ) => {
      state.cryptoAccounts = action.payload;
    },
    setDefaultCryptoAccountCache: (state, action: PayloadAction<string>) => {
      state.defaultCryptoAccount = action.payload;
    },
    setHideCryptoData: (state, action: PayloadAction<boolean>) => {
      state.hideCryptoData = action.payload;
    },
  },
});

export { initialState, cryptoAccountsCacheSlice };

export const {
  setCryptoAccountsCache,
  setDefaultCryptoAccountCache,
  setHideCryptoData,
} = cryptoAccountsCacheSlice.actions;

const getCryptoAccountsCache = (state: RootState) =>
  state.cryptoAccountsCache.cryptoAccounts;

const getDefaultCryptoAccountCache = (state: RootState) =>
  state.cryptoAccountsCache.defaultCryptoAccount;

const getHideCryptoData = (state: RootState) =>
  state.cryptoAccountsCache.hideCryptoData;

export {
  getCryptoAccountsCache,
  getDefaultCryptoAccountCache,
  getHideCryptoData,
};
