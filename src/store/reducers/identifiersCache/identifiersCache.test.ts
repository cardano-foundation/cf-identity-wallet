import { PayloadAction } from "@reduxjs/toolkit";
import {
  identifiersCacheSlice,
  getIdentifiersCache,
  setIdentifiersCache,
  setFavouritesIdentifiersCache,
  addFavouriteIdentifierCache,
  removeFavouriteIdentifierCache,
  getFavouritesIdentifiersCache,
  setMultiSigGroupCache,
  getMultiSigGroupCache,
} from "./identifiersCache";
import { RootState } from "../../index";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { FavouriteIdentifier, MultiSigGroup } from "./identifiersCache.types";
import { ConnectionStatus } from "../../../core/agent/agent.types";

describe("identifiersCacheSlice", () => {
  const initialState = {
    identifiers: [],
    favourites: [],
    multiSigGroup: undefined,
  };
  it("should return the initial state", () => {
    expect(
      identifiersCacheSlice.reducer(undefined, {} as PayloadAction)
    ).toEqual(initialState);
  });

  it("should handle setIdentifiersCache", () => {
    const identifiers: IdentifierShortDetails[] = [
      {
        id: "id-1",
        displayName: "example-name",
        createdAtUTC: "example-date",
        theme: 0,
        isPending: false,
        signifyName: "Test",
      },
    ];
    const newState = identifiersCacheSlice.reducer(
      initialState,
      setIdentifiersCache(identifiers)
    );
    expect(newState.identifiers).toEqual(identifiers);
  });

  it("should handle setMultiSigGroupCache", () => {
    const multiSigGroup: MultiSigGroup = {
      groupId: "group-id",
      connections: [
        {
          id: "did:example:ebfeb1ebc6f1c276ef71212ec21",
          label: "Cambridge University",
          connectionDate: "2017-08-13T19:23:24Z",
          logo: "logo.png",
          status: ConnectionStatus.CONFIRMED,
        },
      ],
    };
    const newState = identifiersCacheSlice.reducer(
      initialState,
      setMultiSigGroupCache(multiSigGroup)
    );
    expect(newState.multiSigGroup).toEqual(multiSigGroup);
  });
  it("should handle setFavouritesIdentifiersCache", () => {
    const favourites: FavouriteIdentifier[] = [
      {
        id: "abcd",
        time: 1,
      },
    ];
    const newState = identifiersCacheSlice.reducer(
      initialState,
      setFavouritesIdentifiersCache(favourites)
    );
    expect(newState.favourites).toEqual(favourites);
  });
  it("should handle addFavouriteIdentifierCache", () => {
    const favourite: FavouriteIdentifier = {
      id: "abcd",
      time: 1,
    };
    const newState = identifiersCacheSlice.reducer(
      initialState,
      addFavouriteIdentifierCache(favourite)
    );
    expect(newState.favourites).toEqual([favourite]);
  });
  it("should handle removeFavouriteIdentifierCache", () => {
    const initialState = {
      identifiers: [],
      favourites: [
        {
          id: "abcd",
          time: 1,
        },
      ],
      multiSigGroup: undefined,
    };
    const newState = identifiersCacheSlice.reducer(
      initialState,
      removeFavouriteIdentifierCache("abcd")
    );
    expect(newState.favourites).toEqual([]);
  });
});

describe("get identifier Cache", () => {
  it("should return the identifiers cache from RootState", () => {
    const state = {
      identifiersCache: {
        identifiers: [
          {
            id: "id-1",
            displayName: "example-name-1",
            createdAtUTC: "example-date",
          },
          {
            id: "id-2",
            displayName: "example-name-2",
            createdAtUTC: "example-date",
          },
        ],
      },
    } as RootState;
    const identifiersCache = getIdentifiersCache(state);
    expect(identifiersCache).toEqual(state.identifiersCache.identifiers);
  });
  it("should return the favourites cache from RootState", () => {
    const state = {
      identifiersCache: {
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
    const favouriteCache = getFavouritesIdentifiersCache(state);
    expect(favouriteCache).toEqual(state.identifiersCache.favourites);
  });
  it("should return the multiSigGroupCache from RootState", () => {
    const state = {
      identifiersCache: {
        multiSigGroup: {
          groupId: "group-id",
          connections: [
            {
              id: "did:example:ebfeb1ebc6f1c276ef71212ec21",
              label: "Cambridge University",
              connectionDate: "2017-08-13T19:23:24Z",
              logo: "logo.png",
              status: ConnectionStatus.CONFIRMED,
            },
          ],
        },
      },
    } as RootState;
    const identifiersCache = getMultiSigGroupCache(state);
    expect(identifiersCache).toEqual(state.identifiersCache.multiSigGroup);
  });
});
