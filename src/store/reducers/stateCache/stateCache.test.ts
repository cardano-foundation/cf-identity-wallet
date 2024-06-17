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
  dequeueCredentialRequest,
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

  test("should set queue connection credential request", () => {
    const connectionCredentialRequestProps: IncomingRequestProps = {
      id: "123",
      type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
      logo: "logo",
      label: "label",
    };
    const action = setQueueIncomingRequest(connectionCredentialRequestProps);
    const nextState = stateCacheSlice.reducer(initialState, action);
    expect(nextState.queueIncomingRequest.queues[0]).toEqual(
      connectionCredentialRequestProps
    );
  });

  test("should set batch queue connection credential request", () => {
    const initialStateMock: StateCacheProps = JSON.parse(
      JSON.stringify(initialState)
    );
    initialStateMock.queueIncomingRequest.queues = [
      {
        id: "123",
        type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
        logo: "logo1",
        label: "label1",
      },
    ];
    const batchIncomingRequestProps: IncomingRequestProps[] = [
      {
        id: "456",
        type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
        logo: "logo2",
        label: "label2",
      },
      {
        id: "789",
        type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
        logo: "logo3",
        label: "label3",
      },
    ];
    const action = enqueueIncomingRequest(batchIncomingRequestProps);
    const nextState = stateCacheSlice.reducer(initialStateMock, action);
    expect(nextState.queueIncomingRequest.queues).toEqual([
      ...initialStateMock.queueIncomingRequest.queues,
      ...batchIncomingRequestProps,
    ]);
  });

  test("should set dequeue connection credential request", () => {
    const initialStateMock: StateCacheProps = JSON.parse(
      JSON.stringify(initialState)
    );
    initialStateMock.queueIncomingRequest.queues = [
      {
        id: "123",
        type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
        logo: "logo1",
        label: "label1",
      },
      {
        id: "456",
        type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
        logo: "logo2",
        label: "label2",
      },
    ];
    const action = dequeueCredentialRequest();
    const nextState = stateCacheSlice.reducer(initialStateMock, action);
    expect(nextState.queueIncomingRequest.queues.length).toEqual(1);
    expect(nextState.queueIncomingRequest.isProcessing).toEqual(true);
  });

  test("should set pause queue connection credential request", () => {
    const action = setPauseQueueIncomingRequest(true);
    const nextState = stateCacheSlice.reducer(initialState, action);
    expect(nextState.queueIncomingRequest.isPaused).toEqual(true);
  });

  test("isProcessing should be false when isPause equal true", () => {
    const action1 = setPauseQueueIncomingRequest(true);
    const nextState1 = stateCacheSlice.reducer(initialState, action1);
    const connectionCredentialRequestProps: IncomingRequestProps = {
      id: "123",
      type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
      logo: "logo",
      label: "label",
    };
    const action2 = setQueueIncomingRequest(connectionCredentialRequestProps);
    const nextState2 = stateCacheSlice.reducer(nextState1, action2);
    expect(nextState2.queueIncomingRequest.isProcessing).toEqual(false);
    expect(nextState2.queueIncomingRequest.queues[0]).toEqual(
      connectionCredentialRequestProps
    );
  });

  test("isProcessing should be true after dequeueCredentialRequest and queue still has elements", () => {
    const initialStateMock: StateCacheProps = JSON.parse(
      JSON.stringify(initialState)
    );
    initialStateMock.queueIncomingRequest.queues = [
      {
        id: "123",
        type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
        logo: "logo1",
        label: "label1",
      },
      {
        id: "",
        type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
        logo: "logo2",
        label: "label2",
      },
    ];
    const action = dequeueCredentialRequest();
    const nextState = stateCacheSlice.reducer(initialStateMock, action);
    expect(nextState.queueIncomingRequest.queues.length).toEqual(1);
    expect(nextState.queueIncomingRequest.isProcessing).toEqual(true);
  });
});
