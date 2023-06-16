import { PayloadAction } from "@reduxjs/toolkit";
import { credsCacheSlice, getCredsCache, setCredsCache } from "./credsCache";
import { CardsStackProps } from "../../../ui/components/CardsStack/CardsStack.types";
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
    const creds: CardsStackProps[] = [
      {
        id: "cred-1",
        type: "creds",
        name: "example-name",
        date: "example-date",
        colors: ["#92FFC0", "#47FF94"],
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
            id: "cred-1",
            type: "creds",
            name: "example-name-1",
            date: "example-date",
            colors: ["#92FFC0", "#47FF94"],
          },
          {
            id: "cred-2",
            type: "creds",
            name: "example-name-2",
            date: "example-date",
            colors: ["#16FFB0", "#57FFA4"],
          },
        ],
      },
    } as RootState;
    const credsCache = getCredsCache(state);
    expect(credsCache).toEqual(state.credsCache.creds);
  });
});
