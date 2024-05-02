import { v4 as uuidv4 } from "uuid";
import { CreateIdentifierResult } from "../agent.types";
import {
  IdentifierMetadataRecord,
  IdentifierMetadataRecordProps,
} from "../records";
import { AgentService } from "./agentService";
import { waitAndGetDoneOp } from "./utils";

class DelegationService extends AgentService {
  async createDelegatedIdentifier(
    metadata: Omit<
      IdentifierMetadataRecordProps,
      "id" | "createdAt" | "isArchived" | "signifyName"
    >,
    delegatorPrefix: string
  ): Promise<CreateIdentifierResult> {
    const signifyName = uuidv4();
    const operation = await this.signifyClient
      .identifiers()
      .create(signifyName, { delpre: delegatorPrefix });
    const identifier = operation.serder.ked.i;
    await this.identifierStorage.createIdentifierMetadataRecord({
      id: identifier,
      ...metadata,
      signifyName: signifyName,
      isPending: true,
    });
    return { identifier, signifyName };
  }

  async approveDelegation(
    signifyName: string,
    delegatePrefix: string
  ): Promise<void> {
    const anchor = {
      i: delegatePrefix,
      s: "0",
      d: delegatePrefix,
    };
    const ixnResult = await this.signifyClient
      .identifiers()
      .interact(signifyName, anchor);
    const operation = await ixnResult.op();
    await waitAndGetDoneOp(this.signifyClient, operation);
    return operation.done;
  }

  async checkDelegationSuccess(
    metadata: IdentifierMetadataRecord
  ): Promise<boolean> {
    if (!metadata.isPending) {
      return true;
    }
    const identifier = await this.signifyClient
      .identifiers()
      .get(metadata.signifyName);
    const operation = await this.signifyClient
      .keyStates()
      .query(identifier.state.di, "1");
    await waitAndGetDoneOp(this.signifyClient, operation);
    const isDone = operation.done;
    if (isDone) {
      await this.identifierStorage.updateIdentifierMetadata(metadata.id, {
        isPending: false,
      });
    }
    return isDone;
  }
}

export { DelegationService };
