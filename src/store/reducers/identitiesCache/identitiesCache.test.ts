import { PayloadAction } from "@reduxjs/toolkit";
import {
  identitiesCacheSlice,
  getIdentitiesCache,
  setIdentitiesCache,
  setFavouritesIdentitiesCache,
  addFavouriteIdentityCache,
  removeFavouriteIdentityCache,
  getFavouritesIdentitiesCache,
} from "./identitiesCache";
import { RootState } from "../../index";
import {
  IdentifierShortDetails,
  IdentifierType,
} from "../../../core/agent/agent.types";
import { FavouriteIdentity } from "./identitiesCache.types";

describe("identitiesCacheSlice", () => {
  const initialState = {
    identities: [],
    favourites: [],
  };
  it("should return the initial state", () => {
    expect(
      identitiesCacheSlice.reducer(undefined, {} as PayloadAction)
    ).toEqual(initialState);
  });

  it("should handle setIdentitiesCache", () => {
    const identities: IdentifierShortDetails[] = [
      {
        id: "id-1",
        method: IdentifierType.KEY,
        displayName: "example-name",
        createdAtUTC: "example-date",
        colors: ["#92FFC0", "#47FF94"],
      },
    ];
    const newState = identitiesCacheSlice.reducer(
      initialState,
      setIdentitiesCache(identities)
    );
    expect(newState.identities).toEqual(identities);
  });
  it("should handle setFavouritesIdentitiesCache", () => {
    const favourites: FavouriteIdentity[] = [
      {
        id: "abcd",
        time: 1,
      },
    ];
    const newState = identitiesCacheSlice.reducer(
      initialState,
      setFavouritesIdentitiesCache(favourites)
    );
    expect(newState.favourites).toEqual(favourites);
  });
  it("should handle addFavouriteIdentityCache", () => {
    const favourite: FavouriteIdentity = {
      id: "abcd",
      time: 1,
    };
    const newState = identitiesCacheSlice.reducer(
      initialState,
      addFavouriteIdentityCache(favourite)
    );
    expect(newState.favourites).toEqual([favourite]);
  });
  it("should handle removeFavouriteIdentityCache", () => {
    const initialState = {
      identities: [],
      favourites: [
        {
          id: "abcd",
          time: 1,
        },
      ],
    };
    const newState = identitiesCacheSlice.reducer(
      initialState,
      removeFavouriteIdentityCache("abcd")
    );
    expect(newState.favourites).toEqual([]);
  });
});

describe("get identity Cache", () => {
  it("should return the identities cache from RootState", () => {
    const state = {
      identitiesCache: {
        identities: [
          {
            id: "id-1",
            method: IdentifierType.KEY,
            displayName: "example-name-1",
            createdAtUTC: "example-date",
            colors: ["#92FFC0", "#47FF94"],
          },
          {
            id: "id-2",
            method: IdentifierType.KEY,
            displayName: "example-name-2",
            createdAtUTC: "example-date",
            colors: ["#FFBC60", "#FFA21F"],
          },
        ],
      },
    } as RootState;
    const identitiesCache = getIdentitiesCache(state);
    expect(identitiesCache).toEqual(state.identitiesCache.identities);
  });
  it("should return the favourites cache from RootState", () => {
    const state = {
      identitiesCache: {
        favourites: [
          {
            id: "id-1",
            time: 1,
          },
          {
            id: "id-2",
            time: 2,
          },
        ],
      },
    } as RootState;
    const favouriteCache = getFavouritesIdentitiesCache(state);
    expect(favouriteCache).toEqual(state.identitiesCache.favourites);
  });
});
