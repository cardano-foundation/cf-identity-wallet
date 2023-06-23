import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { CryptoAccountProps } from "../../../ui/pages/Crypto/Crypto.types";
const initialState: { cryptoAccounts: CryptoAccountProps[] } = {
  cryptoAccounts: [],
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
  },
});

export { initialState, cryptoAccountsCacheSlice };

export const { setCryptoAccountsCache } = cryptoAccountsCacheSlice.actions;

const getCryptoAccountsCache = (state: RootState) =>
  state.cryptoAccountsCache.cryptoAccounts;

export { getCryptoAccountsCache };
