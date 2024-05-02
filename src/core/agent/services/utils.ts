import { Operation, SignifyClient } from "signify-ts";
import { CredentialMetadataRecord } from "../records";
import { CredentialShortDetails } from "./credentialService.types";
import { Agent } from "../agent";

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

export const OnlineOnly = (
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => {
  const originalMethod = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    const isKeriOnline = Agent.agent.getKeriaOnlineStatus();
    if (!isKeriOnline) {
      throw new Error(Agent.KERIA_CONNECTION_BROKEN);
    }
    // Call the original method
    try {
      const executeResult = await originalMethod.apply(this, args);
      return executeResult;
    } catch (error) {
      const errorStack = (error as Error).stack;
      /** If the error is failed to fetch with signify,
       * we retry until the connection is secured*/
      if (errorStack && /SignifyClient/gi.test(errorStack)) {
        await Agent.agent.bootAndConnect(1000);
        const executeResult = await originalMethod.apply(this, args);
        return executeResult;
      } else {
        throw error;
      }
    }
  };
};

export { waitAndGetDoneOp, getCredentialShortDetails };
