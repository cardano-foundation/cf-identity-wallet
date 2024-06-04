import { PayloadAction } from "@reduxjs/toolkit";
import {
  credsArchivedSlice,
  getCredsArchived,
  setCredsArchived,
} from "./credsArchived";
import { RootState } from "../../index";
import { CredentialMetadataRecordStatus } from "../../../core/agent/records/credentialMetadataRecord.types";
import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";

describe("credsArchivedSlice", () => {
  const initialState = {
    creds: [],
  };
  it("should return the initial state", () => {
    expect(credsArchivedSlice.reducer(undefined, {} as PayloadAction)).toEqual(
      initialState
    );
  });

  it("should handle setCredsArchived", () => {
    const creds: CredentialShortDetails[] = [
      {
        id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
        issuanceDate: "2010-01-01T19:23:24Z",
        credentialType: "University Credential",
        status: CredentialMetadataRecordStatus.CONFIRMED,
      },
    ];
    const newState = credsArchivedSlice.reducer(
      initialState,
      setCredsArchived(creds)
    );
    expect(newState.creds).toEqual(creds);
  });
});

describe("get methods for CredsArchived", () => {
  it("should return the creds archived from RootState", () => {
    const state = {
      credsArchived: {
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
    const credsArchived = getCredsArchived(state);
    expect(credsArchived).toEqual(state.credsArchived.creds);
  });
});
