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
        id: "did:example:ebfeb1ebc6f1c276ef71212ec21",
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
            id: "did:example:ebfeb1ebc6f1c276ef71212ec21",
            issuer: "Cambridge University",
            issuanceDate: "2017-08-13T19:23:24Z",
            issuerLogo: "logo.png",
            status: "pending",
          },
          {
            id: "did:example:ebfeb1ebc6f1c276ef71212ec22",
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
