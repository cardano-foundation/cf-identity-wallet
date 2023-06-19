import { PayloadAction } from "@reduxjs/toolkit";
import { credsCacheSlice, getCredsCache, setCredsCache } from "./credsCache";
import { CredProps } from "../../../ui/components/CardsStack/CardsStack.types";
import { RootState } from "../../index";

describe("credsCacheSlice", () => {
  const initialState = {
    creds: [],
  };
  it("should return the initial state", () => {
    expect(credsCacheSlice.reducer(undefined, {} as PayloadAction)).toEqual(
      initialState
    );
  });

  it("should handle setCredsCache", () => {
    const creds: CredProps[] = [
      {
        issuanceDate: "2010-01-01T19:23:24Z",
        credentialType: "University Credential",
        nameOnCredential: "Thomas A. Mayfield",
        issuerLogo: "https://placehold.co/120x22",
        colors: ["#FFBC60", "#FFA21F"],
      },
    ];
    const newState = credsCacheSlice.reducer(
      initialState,
      setCredsCache(creds)
    );
    expect(newState.creds).toEqual(creds);
  });
});

describe("getCredsCache", () => {
  it("should return the creds cache from RootState", () => {
    const state = {
      credsCache: {
        creds: [
          {
            issuanceDate: "2010-01-01T19:23:24Z",
            credentialType: "University Credential",
            nameOnCredential: "Thomas A. Mayfield",
            issuerLogo: "https://placehold.co/120x22",
            colors: ["#FFBC60", "#FFA21F"],
          },
          {
            issuanceDate: "2010-01-01T19:23:24Z",
            credentialType: "University Credential",
            nameOnCredential: "Thomas A. Mayfield",
            issuerLogo: "https://placehold.co/120x22",
            colors: ["#FFBC60", "#FFA21F"],
          },
        ],
      },
    } as RootState;
    const credsCache = getCredsCache(state);
    expect(credsCache).toEqual(state.credsCache.creds);
  });
});
