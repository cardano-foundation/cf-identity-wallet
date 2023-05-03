import { PayloadAction } from "@reduxjs/toolkit";

import {
  AuthenticationCacheProps,
  CurrentRouteCacheProps,
  getAuthentication,
  getCurrentRoute,
  getStateCache,
  initialState,
  setAuthentication,
  setCurrentRoute,
  StateCacheSlice,
} from "./StateCache";
import { RootState } from "../../index";

describe("State Cache", () => {
  test("should return the initial state on first run", () => {
    expect(StateCacheSlice.reducer(undefined, {} as PayloadAction)).toEqual(
      initialState
    );
  });

  test("should set the current route cache", () => {
    const currentRoute: CurrentRouteCacheProps = {
      path: "/",
      payload: {},
    };
    const action = setCurrentRoute(currentRoute);
    const nextState = StateCacheSlice.reducer(initialState, action);

    expect(nextState.currentRoute).toEqual(currentRoute);
    expect(nextState).not.toBe(initialState);

    const rootState = { stateCache: nextState } as RootState;
    expect(getCurrentRoute(rootState)).toEqual(nextState.currentRoute);
    expect(getStateCache(rootState)).toEqual(nextState);
  });

  test("should set the authentication cache", () => {
    const authentication: AuthenticationCacheProps = {
      loggedIn: false,
      time: 0,
    };
    const action = setAuthentication(authentication);
    const nextState = StateCacheSlice.reducer(initialState, action);

    expect(nextState.authentication).toEqual(authentication);
    expect(nextState).not.toBe(initialState);

    const rootState = { stateCache: nextState } as RootState;
    expect(getAuthentication(rootState)).toEqual(nextState.authentication);
    expect(getStateCache(rootState)).toEqual(nextState);
  });
});
