import { PayloadAction } from "@reduxjs/toolkit";
import {
  clearViewTypeCache,
  setCredentialFavouriteIndex,
  setCredentialViewTypeCache,
  setIdentifierFavouriteIndex,
  setIdentifierViewTypeCache,
  viewTypeCacheSlice,
} from "./viewTypeCache";
import { CardListViewType } from "../../../ui/components/SwitchCardView";

describe("identifierViewTypeCache", () => {
  const initialState = {
    identifier: {
      viewType: null,
      favouriteIndex: 0,
    },
    credential: {
      viewType: null,
      favouriteIndex: 0,
    },
  };
  it("should return the initial state", () => {
    expect(viewTypeCacheSlice.reducer(undefined, {} as PayloadAction)).toEqual(
      initialState
    );
  });

  it("should handle setViewTypeCache", () => {
    const newState = viewTypeCacheSlice.reducer(
      initialState,
      setIdentifierViewTypeCache(CardListViewType.List)
    );
    expect(newState.identifier.viewType).toEqual(CardListViewType.List);
  });

  it("should handle clearViewTypeCache", () => {
    const newState = viewTypeCacheSlice.reducer(
      {
        ...initialState,
        identifier: {
          viewType: null,
          favouriteIndex: 2,
        },
      },
      clearViewTypeCache()
    );
    expect(newState).toEqual(initialState);
  });

  it("should handle setViewTypeCache", () => {
    const newState = viewTypeCacheSlice.reducer(
      initialState,
      setIdentifierViewTypeCache(CardListViewType.List)
    );
    expect(newState.identifier.viewType).toEqual(CardListViewType.List);
  });

  it("should handle setFavouriteIndex", () => {
    const newState = viewTypeCacheSlice.reducer(
      initialState,
      setIdentifierFavouriteIndex(1)
    );
    expect(newState.identifier.favouriteIndex).toEqual(1);
  });

  it("should handle setCreVidewTypeCache", () => {
    const newState = viewTypeCacheSlice.reducer(
      initialState,
      setCredentialViewTypeCache(CardListViewType.List)
    );
    expect(newState.credential.viewType).toEqual(CardListViewType.List);
  });

  it("should handle setCredFavouriteIndex", () => {
    const newState = viewTypeCacheSlice.reducer(
      initialState,
      setCredentialFavouriteIndex(1)
    );
    expect(newState.credential.favouriteIndex).toEqual(1);
  });
});
