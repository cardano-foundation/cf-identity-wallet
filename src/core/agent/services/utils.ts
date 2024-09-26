import { Operation, SignifyClient } from "signify-ts";
import { CredentialMetadataRecord, NotificationStorage } from "../records";
import { CredentialShortDetails } from "./credentialService.types";
import { Agent } from "../agent";
import { NotificationRoute } from "../agent.types";

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
    schema: metadata.schema,
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
      const errorMessage = (error as Error).message;
      /** If the error is failed to fetch with signify,
       * we retry until the connection is secured*/
      if (
        /Failed to fetch/gi.test(errorMessage) ||
        /Load failed/gi.test(errorMessage)
      ) {
        Agent.agent.markAgentStatus(false);
        Agent.agent.connect(1000);
        throw new Error(Agent.KERIA_CONNECTION_BROKEN);
      } else {
        throw error;
      }
    }
  };
};

export const deleteNotificationRecordById = async (
  client: SignifyClient,
  notificationStorage: NotificationStorage,
  id: string,
  route: NotificationRoute
): Promise<void> => {
  if (!/^\/local/.test(route)) {
    await client.notifications().mark(id);
  }
  await notificationStorage.deleteById(id);
};

export { waitAndGetDoneOp, getCredentialShortDetails };
