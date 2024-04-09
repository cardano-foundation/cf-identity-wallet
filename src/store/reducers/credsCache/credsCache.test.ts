import { PayloadAction } from "@reduxjs/toolkit";
import {
  addFavouritesCredsCache,
  credsCacheSlice,
  getCredsCache,
  getFavouritesCredsCache,
  removeFavouritesCredsCache,
  setCredsCache,
  setFavouritesCredsCache,
  updateOrAddCredsCache,
} from "./credsCache";
import { RootState } from "../../index";
import { CredentialMetadataRecordStatus } from "../../../core/agent/records/credentialMetadataRecord.types";
import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";
import { FavouriteIdentifier } from "../identifiersCache/identifiersCache.types";

describe("credsCacheSlice", () => {
  const initialState = {
    creds: [],
    favourites: [],
  };
  it("should return the initial state", () => {
    expect(credsCacheSlice.reducer(undefined, {} as PayloadAction)).toEqual(
      initialState
    );
  });

  it("should handle setCredsCache", () => {
    const creds: CredentialShortDetails[] = [
      {
        id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
        issuanceDate: "2010-01-01T19:23:24Z",
        credentialType: "University Credential",
        colors: ["#FFBC60", "#FFA21F"],
        status: CredentialMetadataRecordStatus.CONFIRMED,
      },
    ];
    const newState = credsCacheSlice.reducer(
      initialState,
      setCredsCache(creds)
    );
    expect(newState.creds).toEqual(creds);
  });

  it("should handle add cred when cred does not exist", () => {
    const cred: CredentialShortDetails = {
      id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
      issuanceDate: "2010-01-01T19:23:24Z",
      credentialType: "University Credential",
      colors: ["#FFBC60", "#FFA21F"],
      status: CredentialMetadataRecordStatus.CONFIRMED,
    };
    const newState = credsCacheSlice.reducer(
      initialState,
      updateOrAddCredsCache(cred)
    );
    expect(newState.creds).toEqual([cred]);
  });

  it("should handle update cred when cred exist", () => {
    const credId1 = "did:example:ebfeb1f712ebc6f1c276e12ec21";
    const credId2 = "did:example:ebfeb1f712ebc6f1c276e12ec22";
    const cred1: CredentialShortDetails = {
      id: credId1,
      issuanceDate: "2010-01-01T19:23:24Z",
      credentialType: "University Credential",
      colors: ["#FFBC60", "#FFA21F"],
      status: CredentialMetadataRecordStatus.PENDING,
    };
    const cred2: CredentialShortDetails = {
      id: credId2,
      issuanceDate: "2010-01-01T19:23:24Z",
      credentialType: "University Credential",
      colors: ["#FFBC60", "#FFA21F"],
      status: CredentialMetadataRecordStatus.PENDING,
    };
    const updateCred: CredentialShortDetails = {
      ...cred1,
      status: CredentialMetadataRecordStatus.CONFIRMED,
    };
    const newState = credsCacheSlice.reducer(
      { creds: [cred1, cred2], favourites: [] },
      updateOrAddCredsCache(updateCred)
    );
    expect(newState.creds).toEqual([cred2, updateCred]);
  });

  it("should handle setFavouritesCredsCache", () => {
    const favs: FavouriteIdentifier[] = [
      {
        id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
        time: 1,
      },
    ];
    const newState = credsCacheSlice.reducer(
      initialState,
      setFavouritesCredsCache(favs)
    );
    expect(newState.favourites).toEqual(favs);
  });

  it("should handle addFavouritesCredsCache", () => {
    const fav: FavouriteIdentifier = {
      id: "abcd",
      time: 1,
    };
    const newState = credsCacheSlice.reducer(
      initialState,
      addFavouritesCredsCache(fav)
    );
    expect(newState.favourites).toEqual([fav]);
  });

  it("should handle removeFavouritesCredsCache", () => {
    const state = {
      creds: [],
      favourites: [
        {
          id: "abcd",
          time: 1,
        },
      ],
    };
    const newState = credsCacheSlice.reducer(
      state,
      removeFavouritesCredsCache("abcd")
    );
    expect(newState.favourites).toEqual([]);
  });
});

describe("get methods for CredsCache", () => {
  it("should return the creds cache from RootState", () => {
    const state = {
      credsCache: {
        creds: [
          {
            id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
            issuanceDate: "2010-01-01T19:23:24Z",
            credentialType: "University Credential",
            nameOnCredential: "Thomas A. Mayfield",
            colors: ["#FFBC60", "#FFA21F"],
            status: "confirmed",
          },
          {
            id: "did:example:ebfeb1f712ebc6f1c276e12ec22",
            issuanceDate: "2010-01-01T19:23:24Z",
            credentialType: "University Credential",
            colors: ["#FFBC60", "#FFA21F"],
            status: "confirmed",
          },
        ],
      },
    } as RootState;
    const credsCache = getCredsCache(state);
    expect(credsCache).toEqual(state.credsCache.creds);
  });
  it("should return the favourites creds cache from RootState", () => {
    const state = {
      credsCache: {
        favourites: [
          {
            id: "abcd",
            time: 1,
          },
          {
            id: "efgh",
            time: 2,
          },
        ],
      },
    } as RootState;
    const favouritesCredsCache = getFavouritesCredsCache(state);
    expect(favouritesCredsCache).toEqual(state.credsCache.favourites);
  });
});
