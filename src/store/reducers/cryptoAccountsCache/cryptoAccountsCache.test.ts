import { PayloadAction } from "@reduxjs/toolkit";
import {
  cryptoAccountsCacheSlice,
  getCryptoAccountsCache,
  setCryptoAccountsCache,
} from "./cryptoAccountsCache";
import { RootState } from "../../index";
import { CryptoAccountProps } from "../../../ui/pages/Crypto/Crypto.types";

describe("cryptoAccountsCacheSlice", () => {
  const initialState = {
    cryptoAccounts: [],
  };
  it("should return the initial state", () => {
    expect(
      cryptoAccountsCacheSlice.reducer(undefined, {} as PayloadAction)
    ).toEqual(initialState);
  });

  it("should handle setCryptoAccountsCache", () => {
    const cryptoAccounts: CryptoAccountProps[] = [
      {
        name: "Wallet 1",
        currency: "ADA",
        balance: 2785.82,
        usesIdentitySeedPhrase: false,
      },
    ];
    const newState = cryptoAccountsCacheSlice.reducer(
      initialState,
      setCryptoAccountsCache(cryptoAccounts)
    );
    expect(newState.cryptoAccounts).toEqual(cryptoAccounts);
  });
});

describe("getCryptoAccountsCache", () => {
  it("should return the cryptoAccounts cache from RootState", () => {
    const state = {
      cryptoAccountsCache: {
        cryptoAccounts: [
          {
            name: "Wallet 1",
            currency: "ADA",
            balance: 2785.82,
            usesIdentitySeedPhrase: false,
          },
          {
            name: "Wallet 2",
            currency: "ADA",
            balance: 892.36,
            usesIdentitySeedPhrase: false,
          },
        ],
      },
    } as RootState;
    const cryptoAccountsCache = getCryptoAccountsCache(state);
    expect(cryptoAccountsCache).toEqual(
      state.cryptoAccountsCache.cryptoAccounts
    );
  });
});
