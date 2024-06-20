import { PayloadAction } from "@reduxjs/toolkit";
import {
  credsArchivedCacheSlice,
  setCredsArchivedCache,
  getCredsArchivedCache,
} from "./credsArchivedCache";
import { RootState } from "../../index";
import { CredentialMetadataRecordStatus } from "../../../core/agent/records/credentialMetadataRecord.types";
import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";

describe("credsArchivedCacheSlice", () => {
  const initialState = {
    creds: [],
  };
  it("should return the initial state", () => {
    expect(
      credsArchivedCacheSlice.reducer(undefined, {} as PayloadAction)
    ).toEqual(initialState);
  });

  it("should handle setCredsArchivedCache", () => {
    const creds: CredentialShortDetails[] = [
      {
        id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
        issuanceDate: "2010-01-01T19:23:24Z",
        credentialType: "University Credential",
        status: CredentialMetadataRecordStatus.CONFIRMED,
      },
    ];
    const newState = credsArchivedCacheSlice.reducer(
      initialState,
      setCredsArchivedCache(creds)
    );
    expect(newState.creds).toEqual(creds);
  });
});

describe("get methods for CredsArchivedCache", () => {
  it("should return the creds archived cache from RootState", () => {
    const state = {
      credsArchivedCache: {
        creds: [
          {
            id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
            issuanceDate: "2010-01-01T19:23:24Z",
            credentialType: "University Credential",
            nameOnCredential: "Thomas A. Mayfield",
            status: "confirmed",
          },
          {
            id: "did:example:ebfeb1f712ebc6f1c276e12ec22",
            issuanceDate: "2010-01-01T19:23:24Z",
            credentialType: "University Credential",
            status: "confirmed",
          },
        ],
      },
    } as RootState;
    const credsArchivedCache = getCredsArchivedCache(state);
    expect(credsArchivedCache).toEqual(state.credsArchivedCache.creds);
  });
});
