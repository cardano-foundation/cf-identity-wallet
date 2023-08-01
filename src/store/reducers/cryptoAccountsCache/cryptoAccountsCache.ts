import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { CryptoAccountProps } from "../../../ui/pages/Crypto/Crypto.types";
const initialState: {
  cryptoAccounts: CryptoAccountProps[];
  defaultCryptoAccount: string;
  hideCryptoBalances: boolean;
} = {
  cryptoAccounts: [],
  defaultCryptoAccount: "",
  hideCryptoBalances: false,
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
    setHideCryptoBalances: (state, action: PayloadAction<boolean>) => {
      state.hideCryptoBalances = action.payload;
    },
  },
});

export { initialState, cryptoAccountsCacheSlice };

export const {
  setCryptoAccountsCache,
  setDefaultCryptoAccountCache,
  setHideCryptoBalances,
} = cryptoAccountsCacheSlice.actions;

const getCryptoAccountsCache = (state: RootState) =>
  state.cryptoAccountsCache.cryptoAccounts;

const getDefaultCryptoAccountCache = (state: RootState) =>
  state.cryptoAccountsCache.defaultCryptoAccount;

const getHideCryptoBalances = (state: RootState) =>
  state.cryptoAccountsCache.hideCryptoBalances;

export {
  getCryptoAccountsCache,
  getDefaultCryptoAccountCache,
  getHideCryptoBalances,
};
