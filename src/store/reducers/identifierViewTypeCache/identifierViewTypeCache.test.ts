import { PayloadAction } from "@reduxjs/toolkit";
import {
  identifierViewTypeCacheSlice,
  setViewTypeCache,
} from "./identifierViewTypeCache";
import { CardListViewType } from "../../../ui/components/SwitchCardView";

describe("identifierViewTypeCache", () => {
  const initialState = {
    viewType: null,
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
});
