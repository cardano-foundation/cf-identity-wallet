import { PayloadAction } from "@reduxjs/toolkit";
import {
  connectionsCacheSlice,
  getConnectionsCache,
  setConnectionsCache,
} from "./connectionsCache";
import { RootState } from "../../index";
import { ConnectionsProps } from "../../../ui/pages/Connections/Connections.types";

describe("connectionsCacheSlice", () => {
  const initialState = {
    connections: [],
  };
  it("should return the initial state", () => {
    expect(
      connectionsCacheSlice.reducer(undefined, {} as PayloadAction)
    ).toEqual(initialState);
  });

  it("should handle setCredsCache", () => {
    const connections: ConnectionsProps[] = [
      {
        issuer: "Cambridge University",
        issuanceDate: "2017-08-13T19:23:24Z",
        issuerLogo: "logo.png",
        status: "pending",
      },
    ];
    const newState = connectionsCacheSlice.reducer(
      initialState,
      setConnectionsCache(connections)
    );
    expect(newState.connections).toEqual(connections);
  });
});

describe("getConnectioncCache", () => {
  it("should return the connections cache from RootState", () => {
    const state = {
      connectionsCache: {
        connections: [
          {
            issuer: "Cambridge University",
            issuanceDate: "2017-08-13T19:23:24Z",
            issuerLogo: "logo.png",
            status: "pending",
          },
          {
            issuer: "Passport Office",
            issuanceDate: "2017-08-13T19:23:24Z",
            issuerLogo: "logo.png",
            status: "confirmed",
          },
        ],
      },
    } as RootState;
    const connectionsCache = getConnectionsCache(state);
    expect(connectionsCache).toEqual(state.connectionsCache.connections);
  });
});
