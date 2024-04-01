import { Operation, Serder, SignifyClient } from "signify-ts";
import { CredentialMetadataRecord } from "../records";
import { CredentialShortDetails } from "./credentialService.types";
import {
  Aid,
  CreateMultisigExnPayload,
} from "../agent.types";
import { MultiSigRoute } from "../agent.types";

async function waitAndGetDoneOp(
  client: SignifyClient,
  op: any,
  timeout: number = 15000,
  interval: number = 250
): Promise<Operation> {
  const startTime = new Date().getTime();
  while (!op.done && new Date().getTime() < startTime + timeout) {
    op = await client.operations().get(op.name);
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  return op;
}

async function sendMultisigExn(
  client: SignifyClient,
  name: string,
  aid: Aid,
  route: MultiSigRoute,
  embeds: {
    icp?: (string | Serder)[];
    rot?: (string | Serder)[];
  },
  recp: any,
  payload: CreateMultisigExnPayload
): Promise<any> {
  return client
    .exchanges()
    .send(name, "multisig", aid, route, payload, embeds, recp);
}

function getCredentialShortDetails(
  metadata: CredentialMetadataRecord
): CredentialShortDetails {
  return {
    id: metadata.id,
    colors: metadata.colors,
    issuanceDate: metadata.issuanceDate,
    credentialType: metadata.credentialType,
    status: metadata.status,
    connectionType: metadata.connectionType,
  };
}

export { waitAndGetDoneOp, getCredentialShortDetails, sendMultisigExn };
