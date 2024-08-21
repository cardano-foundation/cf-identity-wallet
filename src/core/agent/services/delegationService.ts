import { v4 as uuidv4 } from "uuid";
import { AgentServicesProps, CreateIdentifierResult } from "../agent.types";
import {
  IdentifierMetadataRecord,
  IdentifierMetadataRecordProps,
  IdentifierStorage,
} from "../records";
import { AgentService } from "./agentService";
import { OnlineOnly, waitAndGetDoneOp } from "./utils";

class DelegationService extends AgentService {
  protected readonly identifierStorage: IdentifierStorage;
  static readonly IDENTIFIER_NOT_DELEGATED = "Invalid is not delegated";

  constructor(
    agentServiceProps: AgentServicesProps,
    identifierStorage: IdentifierStorage
  ) {
    super(agentServiceProps);
    this.identifierStorage = identifierStorage;
  }
  @OnlineOnly
  async createDelegatedIdentifier(
    metadata: Omit<
      IdentifierMetadataRecordProps,
      "id" | "createdAt" | "isArchived" | "signifyName"
    >,
    delegatorPrefix: string
  ): Promise<CreateIdentifierResult> {
    const signifyName = uuidv4();
    const operation = await this.props.signifyClient
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

  @OnlineOnly
  async approveDelegation(
    signifyName: string,
    delegatePrefix: string
  ): Promise<void> {
    const anchor = {
      i: delegatePrefix,
      s: "0",
      d: delegatePrefix,
    };
    const ixnResult = await this.props.signifyClient
      .identifiers()
      .interact(signifyName, anchor);
    const operation = await ixnResult.op();
    await waitAndGetDoneOp(this.props.signifyClient, operation);
    return operation.done;
  }

  @OnlineOnly
  async checkDelegationSuccess(
    metadata: IdentifierMetadataRecord
  ): Promise<boolean> {
    if (!metadata.isPending) {
      return true;
    }
    const identifier = await this.props.signifyClient
      .identifiers()
      .get(metadata.signifyName);
    if (!identifier.state.di) {
      throw new Error(DelegationService.IDENTIFIER_NOT_DELEGATED);
    }
    const operation = await this.props.signifyClient
      .keyStates()
      .query(identifier.state.di, "1");
    await waitAndGetDoneOp(this.props.signifyClient, operation);
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
