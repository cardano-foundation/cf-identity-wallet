import { Operation, Salter, SignifyClient } from "signify-ts";
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
    identifierType: metadata.identifierType,
    identifierId: metadata.identifierId,
    connectionId: metadata.connectionId
  };
}

export const OnlineOnly = (
  _target: any,
  _propertyKey: string,
  descriptor: PropertyDescriptor
) => {
  const originalMethod = descriptor.value;
  descriptor.value = async function (...args: any[]) {
    if (!Agent.agent.getKeriaOnlineStatus()) {
      throw new Error(Agent.KERIA_CONNECTION_BROKEN);
    }
    // Call the original method
    try {
      const executeResult = await originalMethod.apply(this, args);
      return executeResult;
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      if (isNetworkError(error)) {
        Agent.agent.markAgentStatus(false);
        Agent.agent.connect(1000);
        throw new Error(Agent.KERIA_CONNECTION_BROKEN, {
          cause: error,
        });
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
    await client.notifications().mark(id)
      .catch((error) => {
        const status = error.message.split(" - ")[1];
        if (!/404/gi.test(status)) {
          throw error;
        }
      });
  }
  await notificationStorage.deleteById(id);
};

function randomSalt(): string {
  return new Salter({}).qb64;
}

function isNetworkError(error: Error): boolean {
  if (
    /Failed to fetch/gi.test(error.message) ||
    /network error/gi.test(error.message) ||
    /Load failed/gi.test(error.message) ||
    /NetworkError when attempting to fetch resource./gi.test(error.message) ||
    /The Internet connection appears to be offline./gi.test(error.message) ||
    /504/gi.test(error.message.split(" - ")[1])  // Gateway timeout
  ) {
    return true;
  }

  return false;
}

export { waitAndGetDoneOp, getCredentialShortDetails, randomSalt, isNetworkError };
