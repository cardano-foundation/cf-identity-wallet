import { PayloadAction } from "@reduxjs/toolkit";
import { didsCacheSlice, getDidsCache, setDidsCache } from "./didsCache";
import { DidProps } from "../../../ui/components/CardsStack/CardsStack.types";
import { RootState } from "../../index";

describe("didsCacheSlice", () => {
  const initialState = {
    dids: [],
  };
  it("should return the initial state", () => {
    expect(didsCacheSlice.reducer(undefined, {} as PayloadAction)).toEqual(
      initialState
    );
  });

  it("should handle setDidsCache", () => {
    const dids: DidProps[] = [
      {
        id: "id-1",
        type: "dids",
        name: "example-name",
        date: "example-date",
        colors: ["#92FFC0", "#47FF94"],
      },
    ];
    const newState = didsCacheSlice.reducer(initialState, setDidsCache(dids));
    expect(newState.dids).toEqual(dids);
  });
});

describe("getDidsCache", () => {
  it("should return the dids cache from RootState", () => {
    const state = {
      didsCache: {
        dids: [
          {
            id: "id-1",
            type: "dids",
            name: "example-name-1",
            date: "example-date",
            colors: ["#92FFC0", "#47FF94"],
          },
          {
            id: "id-2",
            type: "dids",
            name: "example-name-2",
            date: "example-date",
            colors: ["#16FFB0", "#57FFA4"],
          },
        ],
      },
    } as RootState;
    const didsCache = getDidsCache(state);
    expect(didsCache).toEqual(state.didsCache.dids);
  });
});
