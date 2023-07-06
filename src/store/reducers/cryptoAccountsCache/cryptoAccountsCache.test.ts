import { PayloadAction } from "@reduxjs/toolkit";
import {
  cryptoAccountsCacheSlice,
  getCryptoAccountsCache,
  getDefaultCryptoAccountCache,
  getHideCryptoBalances,
  setCryptoAccountsCache,
  setDefaultCryptoAccountCache,
  setHideCryptoBalances,
} from "./cryptoAccountsCache";
import { RootState } from "../../index";
import { CryptoAccountProps } from "../../../ui/pages/Crypto/Crypto.types";
import { cryptoAccountsMock } from "../../../ui/__mocks__/cryptoAccountsMock";

describe("cryptoAccountsCacheSlice", () => {
  const initialState = {
    cryptoAccounts: [],
    defaultCryptoAccount: "",
    hideCryptoBalances: false,
  };
  it("should return the initial state", () => {
    expect(
      cryptoAccountsCacheSlice.reducer(undefined, {} as PayloadAction)
    ).toEqual(initialState);
  });

  it("should handle setCryptoAccountsCache", () => {
    const cryptoAccounts: CryptoAccountProps[] = cryptoAccountsMock;
    const newState = cryptoAccountsCacheSlice.reducer(
      initialState,
      setCryptoAccountsCache(cryptoAccounts)
    );
    expect(newState.cryptoAccounts).toEqual(cryptoAccounts);
  });

  it("should handle getCryptoAccountsCache", () => {
    const state = {
      cryptoAccountsCache: {
        cryptoAccounts: cryptoAccountsMock,
      },
    } as RootState;
    const cryptoAccountsCache = getCryptoAccountsCache(state);
    expect(cryptoAccountsCache).toEqual(
      state.cryptoAccountsCache.cryptoAccounts
    );
  });

  it("should handle setDefaultCryptoAccountCache", () => {
    const defaultCryptoAccount =
      "stake1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz";
    const newState = cryptoAccountsCacheSlice.reducer(
      initialState,
      setDefaultCryptoAccountCache(defaultCryptoAccount)
    );
    expect(newState.defaultCryptoAccount).toEqual(defaultCryptoAccount);
  });

  it("should handle getDefaultCryptoAccountCache", () => {
    const state = {
      cryptoAccountsCache: {
        defaultCryptoAccount:
          "stake1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz",
      },
    } as RootState;
    const cryptoAccountsCache = getDefaultCryptoAccountCache(state);
    expect(cryptoAccountsCache).toEqual(
      state.cryptoAccountsCache.defaultCryptoAccount
    );
  });

  it("should handle setHideCryptoBalances", () => {
    const hideCryptoBalances = true;
    const newState = cryptoAccountsCacheSlice.reducer(
      initialState,
      setHideCryptoBalances(hideCryptoBalances)
    );
    expect(newState.hideCryptoBalances).toEqual(hideCryptoBalances);
  });

  it("should handle getHideCryptoBalances", () => {
    const state = {
      cryptoAccountsCache: {
        hideCryptoBalances: true,
      },
    } as RootState;
    const cryptoAccountsCache = getHideCryptoBalances(state);
    expect(cryptoAccountsCache).toEqual(
      state.cryptoAccountsCache.hideCryptoBalances
    );
  });
});
