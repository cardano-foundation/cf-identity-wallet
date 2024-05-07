import { Operation, SignifyClient } from "signify-ts";
import { CredentialMetadataRecord } from "../records";
import { CredentialShortDetails } from "./credentialService.types";

async function waitAndGetDoneOp(
  client: SignifyClient,
  op: any,
  timeout = 15000,
  interval = 250
): Promise<Operation> {
  const startTime = new Date().getTime();
  while (!op.done && new Date().getTime() < startTime + timeout) {
    op = await client.operations().get(op.name);
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  return op;
}

function getCredentialShortDetails(
  metadata: CredentialMetadataRecord
): CredentialShortDetails {
  return {
    id: metadata.id,
    issuanceDate: metadata.issuanceDate,
    credentialType: metadata.credentialType,
    status: metadata.status,
  };
}

export { waitAndGetDoneOp, getCredentialShortDetails };
