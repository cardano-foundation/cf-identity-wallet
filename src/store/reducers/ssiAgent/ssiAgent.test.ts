import { PayloadAction } from "@reduxjs/toolkit";
import {
  clearSSIAgent,
  getSSIAgent,
  setBootUrl,
  setConnectUrl,
  setSSIAgent,
  ssiAgentSlice,
} from "./ssiAgent";
import { SSIAgentState } from "./ssiAgent.types";
import { RootState } from "../..";

describe("SSI Agent Cache", () => {
  const initialState: SSIAgentState = {
    bootUrl: undefined,
    connectUrl: undefined,
  };

  test("should return the initial state on first run", () => {
    expect(ssiAgentSlice.reducer(undefined, {} as PayloadAction)).toEqual(
      initialState
    );
  });

  it("should handle setSSIAgent", () => {
    const ssiAgent: SSIAgentState = {
      bootUrl: "boot url",
      connectUrl: "connect url",
    };
    const newState = ssiAgentSlice.reducer(initialState, setSSIAgent(ssiAgent));
    expect(newState).toEqual(ssiAgent);
  });

  it("should handle setBootUrl", () => {
    const bootUrl = "boot url";
    const newState = ssiAgentSlice.reducer(initialState, setBootUrl(bootUrl));
    expect(newState.bootUrl).toEqual(bootUrl);
  });

  it("should handle setBootUrl", () => {
    const connectUrl = "connect url";
    const newState = ssiAgentSlice.reducer(
      initialState,
      setConnectUrl(connectUrl)
    );
    expect(newState.connectUrl).toEqual(connectUrl);
  });

  it("should handle setConnectUrl", () => {
    const ssiAgent: SSIAgentState = {
      bootUrl: "boot url",
      connectUrl: "connect url",
    };
    const newState = ssiAgentSlice.reducer(initialState, setSSIAgent(ssiAgent));
    expect(newState).toEqual(ssiAgent);
  });

  it("should handle clearSsiAgent", () => {
    const newState = ssiAgentSlice.reducer(initialState, clearSSIAgent());
    expect(newState).toEqual(initialState);
  });

  it("should ssi agent from RootState", () => {
    const state = {
      ssiAgentCache: {
        bootUrl: "boot url",
        connectUrl: "connect url",
      },
    } as RootState;
    const ssiAgent = getSSIAgent(state);
    expect(ssiAgent).toEqual(state.ssiAgentCache);
  });
});
