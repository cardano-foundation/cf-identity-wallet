import { PayloadAction } from "@reduxjs/toolkit";
import {
  identifierViewTypeCacheSlice,
  setFavouriteIndex,
  setViewTypeCache,
} from "./identifierViewTypeCache";
import { CardListViewType } from "../../../ui/components/SwitchCardView";

describe("identifierViewTypeCache", () => {
  const initialState = {
    viewType: null,
    favouriteIndex: 0,
  };
  it("should return the initial state", () => {
    expect(
      identifierViewTypeCacheSlice.reducer(undefined, {} as PayloadAction)
    ).toEqual(initialState);
  });

  it("should handle setViewTypeCache", () => {
    const newState = identifierViewTypeCacheSlice.reducer(
      initialState,
      setViewTypeCache(CardListViewType.List)
    );
    expect(newState.viewType).toEqual(CardListViewType.List);
  });

  it("should handle setFavouriteIndex", () => {
    const newState = identifierViewTypeCacheSlice.reducer(
      initialState,
      setFavouriteIndex(1)
    );
    expect(newState.favouriteIndex).toEqual(1);
  });
});
