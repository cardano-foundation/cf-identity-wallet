import { v4 as uuidv4 } from "uuid";
import {
  CreateIdentifierResult,
  IdentifierFullDetails,
  IdentifierShortDetails,
} from "./identifier.types";
import {
  IdentifierMetadataRecord,
  IdentifierMetadataRecordProps,
} from "../records/identifierMetadataRecord";
import { AgentService } from "./agentService";
import { IdentifierResult } from "../agent.types";
import { waitAndGetDoneOp } from "./utils";

const identifierTypeThemes = [0, 1];

class IdentifierService extends AgentService {
  static readonly DID_MISSING_INCORRECT =
    "DID returned from agent was of unexpected DID method";
  static readonly DID_MISSING_DISPLAY_NAME =
    "DID display name missing for stored DID";
  static readonly DID_MISSING_DID_DOC =
    "DID document missing or unresolvable for stored DID";
  static readonly UNEXPECTED_DID_DOC_FORMAT =
    "DID document format is missing expected values for stored DID";
  static readonly NOT_FOUND_DOMAIN_CONFIG_ERROR_MSG =
    "No domain found in config";
  static readonly IDENTIFIER_METADATA_RECORD_MISSING =
    "Identifier metadata record does not exist";
  static readonly UNEXPECTED_MISSING_DID_RESULT_ON_CREATE =
    "DID was successfully created but the DID was not returned in the state returned";
  static readonly IDENTIFIER_NOT_ARCHIVED = "Identifier was not archived";
  static readonly THEME_WAS_NOT_VALID = "Identifier theme was not valid";
  static readonly EXN_MESSAGE_NOT_FOUND =
    "There's no exchange message for the given SAID";
  static readonly ONLY_ALLOW_KERI_CONTACTS =
    "Can only create multi-sig using KERI contacts with specified OOBI URLs";
  static readonly FAILED_TO_ROTATE_AID =
    "Failed to rotate AID, operation not completing...";

  async getIdentifiers(getArchived = false): Promise<IdentifierShortDetails[]> {
    const identifiers: IdentifierShortDetails[] = [];
    const listMetadata: IdentifierMetadataRecord[] =
      await this.identifierStorage.getAllIdentifierMetadata(getArchived);

    for (let i = 0; i < listMetadata.length; i++) {
      const metadata = listMetadata[i];
      identifiers.push({
        displayName: metadata.displayName,
        id: metadata.id,
        signifyName: metadata.signifyName,
        createdAtUTC: metadata.createdAt.toISOString(),
        theme: metadata.theme,
        isPending: metadata.isPending ?? false,
        delegated: metadata.delegated,
      });
    }
    return identifiers;
  }

  async getIdentifier(
    identifier: string
  ): Promise<IdentifierFullDetails | undefined> {
    const metadata = await this.identifierStorage.getIdentifierMetadata(
      identifier
    );
    if (metadata.isPending && metadata.signifyOpName) {
      return undefined;
    }
    const aid = await this.signifyClient
      .identifiers()
      .get(metadata.signifyName);

    if (!aid) {
      return undefined;
    }

    return {
      id: aid.prefix,
      displayName: metadata.displayName,
      createdAtUTC: metadata.createdAt.toISOString(),
      signifyName: metadata.signifyName,
      theme: metadata.theme,
      signifyOpName: metadata.signifyOpName,
      isPending: metadata.isPending ?? false,
      s: aid.state.s,
      dt: aid.state.dt,
      kt: aid.state.kt,
      k: aid.state.k,
      nt: aid.state.nt,
      n: aid.state.n,
      bt: aid.state.bt,
      b: aid.state.b,
      di: aid.state.di,
    };
  }

  async createIdentifier(
    metadata: Omit<
      IdentifierMetadataRecordProps,
      "id" | "createdAt" | "isArchived" | "signifyName"
    >
  ): Promise<CreateIdentifierResult> {
    const signifyName = uuidv4();
    const operation = await this.signifyClient
      .identifiers()
      .create(signifyName); //, this.getCreateAidOptions());
    await operation.op();
    await this.signifyClient
      .identifiers()
      .addEndRole(signifyName, "agent", this.signifyClient.agent!.pre);
    const identifier = operation.serder.ked.i;
    this.validIdentifierMetadata(metadata);
    await this.identifierStorage.createIdentifierMetadataRecord({
      id: identifier,
      ...metadata,
      signifyName: signifyName,
    });
    return { identifier, signifyName };
  }

  async archiveIdentifier(identifier: string): Promise<void> {
    return this.identifierStorage.updateIdentifierMetadata(identifier, {
      isArchived: true,
    });
  }

  async deleteIdentifier(identifier: string): Promise<void> {
    const metadata = await this.identifierStorage.getIdentifierMetadata(
      identifier
    );
    this.validArchivedIdentifier(metadata);
    await this.identifierStorage.updateIdentifierMetadata(identifier, {
      isDeleted: true,
    });
  }

  async restoreIdentifier(identifier: string): Promise<void> {
    const metadata = await this.identifierStorage.getIdentifierMetadata(
      identifier
    );
    this.validArchivedIdentifier(metadata);
    await this.identifierStorage.updateIdentifierMetadata(identifier, {
      isArchived: false,
    });
  }

  async updateIdentifier(
    identifier: string,
    data: Pick<IdentifierMetadataRecordProps, "theme" | "displayName">
  ): Promise<void> {
    const metadata = await this.identifierStorage.getIdentifierMetadata(
      identifier
    );
    this.validIdentifierMetadata(metadata);
    return this.identifierStorage.updateIdentifierMetadata(identifier, {
      theme: data.theme,
      displayName: data.displayName,
    });
  }

  async syncKeriaIdentifiers() {
    const { aids: signifyIdentifiers } = await this.signifyClient
      .identifiers()
      .list();
    const storageIdentifiers =
      await this.identifierStorage.getKeriIdentifiersMetadata();
    const unSyncedData = signifyIdentifiers.filter(
      (identifier: IdentifierResult) =>
        !storageIdentifiers.find((item) => identifier.prefix === item.id)
    );
    if (unSyncedData.length) {
      //sync the storage with the signify data
      for (const identifier of unSyncedData) {
        await this.identifierStorage.createIdentifierMetadataRecord({
          id: identifier.prefix,
          displayName: identifier.prefix, //same as the id at the moment
          theme: 0,
          signifyName: identifier.name,
        });
      }
    }
  }

  private validArchivedIdentifier(metadata: IdentifierMetadataRecord): void {
    if (!metadata.isArchived) {
      throw new Error(
        `${IdentifierService.IDENTIFIER_NOT_ARCHIVED} ${metadata.id}`
      );
    }
  }

  private validIdentifierMetadata(
    metadata: Pick<IdentifierMetadataRecordProps, "theme">
  ): void {
    if (metadata.theme && !identifierTypeThemes.includes(metadata.theme)) {
      throw new Error(`${IdentifierService.THEME_WAS_NOT_VALID}`);
    }
  }

  async rotateIdentifier(metadata: IdentifierMetadataRecord) {
    const rotateResult = await this.signifyClient
      .identifiers()
      .rotate(metadata.signifyName);
    let operation = await rotateResult.op();
    operation = await waitAndGetDoneOp(this.signifyClient, operation);
    if (!operation.done) {
      throw new Error(IdentifierService.FAILED_TO_ROTATE_AID);
    }
  }
}

export { IdentifierService };
