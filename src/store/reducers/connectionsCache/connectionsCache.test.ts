import { PayloadAction } from "@reduxjs/toolkit";
import {
  addMultisigConnectionCache,
  connectionsCacheSlice,
  getConnectionsCache,
  getMultisigConnectionsCache,
  setConnectionsCache,
  setMultisigConnectionsCache,
  updateMultisigConnectionCache,
  updateOrAddConnectionCache,
} from "./connectionsCache";
import { RootState } from "../../index";
import { ConnectionShortDetails } from "../../../ui/pages/Connections/Connections.types";
import { ConnectionStatus } from "../../../core/agent/agent.types";

const initialState = {
  connections: {},
  multisigConnections: {},
};

const multisigConnection: ConnectionShortDetails = {
  groupId: "group-id",
  id: "did:example:ebfeb1ebc6f1c276ef71212ec21",
  label: "Cambridge University",
  connectionDate: "2017-08-13T19:23:24Z",
  logo: "logo.png",
  status: ConnectionStatus.CONFIRMED,
};

const connection: ConnectionShortDetails = {
  id: "did:example:ebfeb1ebc6f1c276ef71212ec21",
  label: "Cambridge University",
  connectionDate: "2017-08-13T19:23:24Z",
  logo: "logo.png",
  status: ConnectionStatus.PENDING,
};

describe("connectionsCacheSlice", () => {
  it("should return the initial state", () => {
    expect(
      connectionsCacheSlice.reducer(undefined, {} as PayloadAction)
    ).toEqual(initialState);
  });

  it("should handle setConnectionsCache", () => {
    const connections: ConnectionShortDetails[] = [connection];
    const newState = connectionsCacheSlice.reducer(
      initialState,
      setConnectionsCache(connections)
    );
    expect(newState.connections).toEqual({
      "did:example:ebfeb1ebc6f1c276ef71212ec21": connection,
    });
  });

  it("should handle updateOrAddConnectionCache", () => {
    const newState = connectionsCacheSlice.reducer(
      initialState,
      updateOrAddConnectionCache(connection)
    );
    expect(
      newState.connections["did:example:ebfeb1ebc6f1c276ef71212ec21"]
    ).toMatchObject(connection);
  });
});

describe("getConnectionsCache", () => {
  it("should return the connections cache from RootState", () => {
    const state = {
      connectionsCache: {
        connections: {
          "did:example:ebfeb1ebc6f1c276ef71212ec21": {
            id: "did:example:ebfeb1ebc6f1c276ef71212ec21",
            label: "Cambridge University",
            connectionDate: "2017-08-13T19:23:24Z",
            logo: "logo.png",
            status: "pending",
          },
          "did:example:ebfeb1ebc6f1c276ef71212ec22": {
            id: "did:example:ebfeb1ebc6f1c276ef71212ec22",
            label: "Passport Office",
            connectionDate: "2017-08-13T19:23:24Z",
            logo: "logo.png",
            status: "confirmed",
          },
        },
      },
    } as unknown as RootState;
    const connectionsCache = getConnectionsCache(state);
    expect(connectionsCache).toEqual(state.connectionsCache.connections);
  });
});

describe("multisigConnectionsCacheSlice", () => {
  it("should handle setMultisigConnectionsCache", () => {
    const multisigConnections: ConnectionShortDetails[] = [multisigConnection];
    const newState = connectionsCacheSlice.reducer(
      initialState,
      setMultisigConnectionsCache(multisigConnections)
    );
    expect(newState.multisigConnections).toEqual({
      "group-id": [multisigConnection],
    });
  });

  it("should handle updateMultisigConnectionCache", () => {
    const initialState = {
      multisigConnections: {
        "group-id": [multisigConnection],
      },
      connections: {},
    };
    const newState = connectionsCacheSlice.reducer(
      initialState,
      updateMultisigConnectionCache(multisigConnection)
    );

    expect(newState.multisigConnections["group-id"][0]).toMatchObject(
      multisigConnection
    );
  });

  it("should handle addMultisigConnectionCache", () => {
    const newState = connectionsCacheSlice.reducer(
      initialState,
      addMultisigConnectionCache(multisigConnection)
    );

    expect(newState.multisigConnections).toEqual({
      "group-id": [multisigConnection],
    });
  });

  it("should handle updateMultisigConnectionCache", () => {
    const initialState = {
      multisigConnections: {
        "group-id": [multisigConnection],
      },
      connections: {},
    };
    const newState = connectionsCacheSlice.reducer(
      initialState,
      updateMultisigConnectionCache(multisigConnection)
    );

    expect(newState.multisigConnections["group-id"][0]).toMatchObject(
      multisigConnection
    );
  });
});

describe("getMultisigConnectionsCache", () => {
  it("should return the multisig connections cache from RootState", () => {
    const state = {
      connectionsCache: {
        multisigConnections: {
          "group-id": [multisigConnection],
        },
      },
    } as unknown as RootState;
    const multisigConnectionsCache = getMultisigConnectionsCache(state);
    expect(multisigConnectionsCache).toEqual(
      state.connectionsCache.multisigConnections
    );
  });
});
