import { PayloadAction } from "@reduxjs/toolkit";
import {
  AuthenticationCacheProps,
  CurrentRouteCacheProps,
  getAuthentication,
  getCurrentOperation,
  getCurrentRoute,
  getStateCache,
  initialState,
  logout,
  setAuthentication,
  enqueueIncomingRequest,
  setCurrentOperation,
  setCurrentRoute,
  setPauseQueueIncomingRequest,
  setQueueIncomingRequest,
  dequeueIncomingRequest,
  StateCacheProps,
  stateCacheSlice,
  login,
} from "./stateCache";
import { RootState } from "../../index";
import { RoutePath } from "../../../routes";
import { OperationType } from "../../../ui/globals/types";
import { IncomingRequestProps, IncomingRequestType } from "./stateCache.types";

describe("State Cache", () => {
  test("should return the initial state on first run", () => {
    expect(stateCacheSlice.reducer(undefined, {} as PayloadAction)).toEqual(
      initialState
    );
  });

  test("should set the current route cache", () => {
    const currentRoute: CurrentRouteCacheProps = {
      path: RoutePath.ONBOARDING,
      payload: {},
    };
    const action = setCurrentRoute(currentRoute);
    const nextState = stateCacheSlice.reducer(initialState, action);

    expect(nextState.routes[0]).toEqual(currentRoute);
    expect(nextState).not.toBe(initialState);

    const rootState = { stateCache: nextState } as RootState;
    expect(getCurrentRoute(rootState)).toEqual(nextState.routes[0]);
    expect(getStateCache(rootState)).toEqual(nextState);
  });

  test("should set the authentication cache", () => {
    const authentication: AuthenticationCacheProps = {
      loggedIn: false,
      userName: "",
      time: 0,
      passcodeIsSet: false,
      seedPhraseIsSet: false,
      passwordIsSet: false,
      passwordIsSkipped: false,
      ssiAgentIsSet: false,
      recoveryWalletProgress: false,
    };
    const action = setAuthentication(authentication);
    const nextState = stateCacheSlice.reducer(initialState, action);

    expect(nextState.authentication).toEqual(authentication);
    expect(nextState).not.toBe(initialState);

    const rootState = { stateCache: nextState } as RootState;
    expect(getAuthentication(rootState)).toEqual(nextState.authentication);
    expect(getStateCache(rootState)).toEqual(nextState);
  });

  test("should logout", () => {
    const action = logout();
    const nextState = stateCacheSlice.reducer(initialState, action);
    expect(nextState.authentication.loggedIn).toEqual(false);
    expect(nextState).not.toBe(initialState);
  });

  test("should login", () => {
    const action = login();
    const nextState = stateCacheSlice.reducer(initialState, action);
    expect(nextState.authentication.loggedIn).toEqual(true);
    expect(nextState).not.toBe(initialState);
  });

  test("should set the currentOperation cache", () => {
    const op = OperationType.SCAN_CONNECTION;
    const action = setCurrentOperation(op);
    const nextState = stateCacheSlice.reducer(initialState, action);

    expect(nextState.currentOperation).toEqual(op);
    expect(nextState).not.toBe(initialState);

    const rootState = { stateCache: nextState } as RootState;
    expect(getCurrentOperation(rootState)).toEqual(nextState.currentOperation);
    expect(getStateCache(rootState)).toEqual(nextState);
  });
});
