import { PayloadAction } from "@reduxjs/toolkit";
import {
  AuthenticationCacheProps,
  CurrentRouteCacheProps,
  getAuthentication,
  getCurrentOperation,
  getCurrentRoute,
  getStateCache,
  initialState,
  setAuthentication,
  enqueueConnectionCredentialRequest,
  setCurrentOperation,
  setCurrentRoute,
  setPauseQueueConnectionCredentialRequest,
  setQueueConnectionCredentialRequest,
  dequeueCredentialCredentialRequest,
  StateCacheProps,
  stateCacheSlice,
} from "./stateCache";
import { RootState } from "../../index";
import { RoutePath } from "../../../routes";
import { OperationType } from "../../../ui/globals/types";
import {
  ConnectionCredentialRequestProps,
  ConnectionCredentialRequestType,
} from "./stateCache.types";

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
      time: 0,
      passcodeIsSet: false,
      seedPhraseIsSet: false,
      passwordIsSet: false,
      passwordIsSkipped: false,
    };
    const action = setAuthentication(authentication);
    const nextState = stateCacheSlice.reducer(initialState, action);

    expect(nextState.authentication).toEqual(authentication);
    expect(nextState).not.toBe(initialState);

    const rootState = { stateCache: nextState } as RootState;
    expect(getAuthentication(rootState)).toEqual(nextState.authentication);
    expect(getStateCache(rootState)).toEqual(nextState);
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

  test("should set queue connection credential request", () => {
    const connectionCredentialRequestProps: ConnectionCredentialRequestProps = {
      id: "123",
      type: ConnectionCredentialRequestType.CONNECTION_INCOMING,
    };
    const action = setQueueConnectionCredentialRequest(
      connectionCredentialRequestProps
    );
    const nextState = stateCacheSlice.reducer(initialState, action);
    expect(nextState.queueConnectionCredentialRequest.queues[0]).toEqual(
      connectionCredentialRequestProps
    );
  });

  test("should set batch queue connection credential request", () => {
    const initialStateMock: StateCacheProps = JSON.parse(
      JSON.stringify(initialState)
    );
    initialStateMock.queueConnectionCredentialRequest.queues = [
      {
        id: "123",
        type: ConnectionCredentialRequestType.CONNECTION_INCOMING,
      },
    ];
    const batchConnectionCredentialRequestProps: ConnectionCredentialRequestProps[] =
      [
        {
          id: "456",
          type: ConnectionCredentialRequestType.CONNECTION_INCOMING,
        },
        {
          id: "789",
          type: ConnectionCredentialRequestType.CONNECTION_INCOMING,
        },
      ];
    const action = enqueueConnectionCredentialRequest(
      batchConnectionCredentialRequestProps
    );
    const nextState = stateCacheSlice.reducer(initialStateMock, action);
    expect(nextState.queueConnectionCredentialRequest.queues).toEqual([
      ...initialStateMock.queueConnectionCredentialRequest.queues,
      ...batchConnectionCredentialRequestProps,
    ]);
  });

  test("should set dequeue connection credential request", () => {
    const initialStateMock: StateCacheProps = JSON.parse(
      JSON.stringify(initialState)
    );
    initialStateMock.queueConnectionCredentialRequest.queues = [
      {
        id: "123",
        type: ConnectionCredentialRequestType.CONNECTION_INCOMING,
      },
      {
        id: "456",
        type: ConnectionCredentialRequestType.CONNECTION_INCOMING,
      },
    ];
    const action = dequeueCredentialCredentialRequest();
    const nextState = stateCacheSlice.reducer(initialStateMock, action);
    expect(nextState.queueConnectionCredentialRequest.queues.length).toEqual(1);
    expect(nextState.queueConnectionCredentialRequest.isProcessing).toEqual(
      true
    );
  });

  test("should set pause queue connection credential request", () => {
    const action = setPauseQueueConnectionCredentialRequest(true);
    const nextState = stateCacheSlice.reducer(initialState, action);
    expect(nextState.queueConnectionCredentialRequest.isPaused).toEqual(true);
  });

  test("isProcessing should be false when isPause equal true", () => {
    const action1 = setPauseQueueConnectionCredentialRequest(true);
    const nextState1 = stateCacheSlice.reducer(initialState, action1);
    const connectionCredentialRequestProps: ConnectionCredentialRequestProps = {
      id: "123",
      type: ConnectionCredentialRequestType.CONNECTION_INCOMING,
    };
    const action2 = setQueueConnectionCredentialRequest(
      connectionCredentialRequestProps
    );
    const nextState2 = stateCacheSlice.reducer(nextState1, action2);
    expect(nextState2.queueConnectionCredentialRequest.isProcessing).toEqual(
      false
    );
    expect(nextState2.queueConnectionCredentialRequest.queues[0]).toEqual(
      connectionCredentialRequestProps
    );
  });

  test("isProcessing should be true after dequeueCredentialCredentialRequest and queue still has elements", () => {
    const initialStateMock: StateCacheProps = JSON.parse(
      JSON.stringify(initialState)
    );
    initialStateMock.queueConnectionCredentialRequest.queues = [
      {
        id: "123",
        type: ConnectionCredentialRequestType.CONNECTION_INCOMING,
      },
      {
        id: "",
        type: ConnectionCredentialRequestType.CONNECTION_INCOMING,
      },
    ];
    const action = dequeueCredentialCredentialRequest();
    const nextState = stateCacheSlice.reducer(initialStateMock, action);
    expect(nextState.queueConnectionCredentialRequest.queues.length).toEqual(1);
    expect(nextState.queueConnectionCredentialRequest.isProcessing).toEqual(
      true
    );
  });
});
