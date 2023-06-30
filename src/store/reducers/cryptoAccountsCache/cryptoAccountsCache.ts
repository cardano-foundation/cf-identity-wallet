import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { CryptoAccountProps } from "../../../ui/pages/Crypto/Crypto.types";
const initialState: {
  cryptoAccounts: CryptoAccountProps[];
  defaultCryptoAccount: string;
} = {
  cryptoAccounts: [],
  defaultCryptoAccount: "",
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
  },
});

export { initialState, cryptoAccountsCacheSlice };

export const { setCryptoAccountsCache, setDefaultCryptoAccountCache } =
  cryptoAccountsCacheSlice.actions;

const getCryptoAccountsCache = (state: RootState) =>
  state.cryptoAccountsCache.cryptoAccounts;

const getDefaultCryptoAccountCache = (state: RootState) =>
  state.cryptoAccountsCache.defaultCryptoAccount;

export { getCryptoAccountsCache, getDefaultCryptoAccountCache };
