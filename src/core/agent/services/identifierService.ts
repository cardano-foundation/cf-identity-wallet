import { DidRecord, KeyType } from "@aries-framework/core";
import {
  DIDDetails,
  GetIdentifierResult,
  IdentifierShortDetails,
  IdentifierType,
} from "./identifierService.types";
import {
  IdentifierMetadataRecord,
  IdentifierMetadataRecordProps,
} from "../modules/generalStorage/repositories/identifierMetadataRecord";
import { AgentService } from "./agentService";

const identifierTypeMappingTheme: Record<IdentifierType, number[]> = {
  [IdentifierType.KEY]: [0, 1, 2, 3],
  [IdentifierType.KERI]: [4, 5],
};

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

  async getIdentifiers(getArchived = false): Promise<IdentifierShortDetails[]> {
    const identifiers: IdentifierShortDetails[] = [];
    let listMetadata: IdentifierMetadataRecord[];
    if (getArchived) {
      listMetadata =
        await this.agent.modules.generalStorage.getAllArchivedIdentifierMetadata();
    } else {
      listMetadata =
        await this.agent.modules.generalStorage.getAllAvailableIdentifierMetadata();
    }
    for (let i = 0; i < listMetadata.length; i++) {
      const metadata = listMetadata[i];
      identifiers.push({
        method: metadata.method,
        displayName: metadata.displayName,
        id: metadata.id,
        createdAtUTC: metadata.createdAt.toISOString(),
        colors: metadata.colors,
        theme: metadata.theme,
      });
    }
    return identifiers;
  }

  async getIdentifier(
    identifier: string
  ): Promise<GetIdentifierResult | undefined> {
    if (this.isDidIdentifier(identifier)) {
      const storedDid = await this.agent.dids.getCreatedDids({
        did: identifier,
      });
      if (!(storedDid && storedDid.length)) {
        return undefined;
      }

      const method = <IdentifierType>storedDid[0].getTag("method")?.toString();
      if (!method || method !== IdentifierType.KEY) {
        throw new Error(
          `${IdentifierService.DID_MISSING_INCORRECT} ${identifier}`
        );
      }
      return {
        type: IdentifierType.KEY,
        result: await this.getIdentifierFromDidKeyRecord(storedDid[0]),
      };
    } else {
      const metadata = await this.getMetadataById(identifier);
      const aid = await this.agent.modules.signify.getIdentifierByName(
        metadata.signifyName as string
      );
      if (!aid) {
        return undefined;
      }

      return {
        type: IdentifierType.KERI,
        result: {
          id: aid.prefix,
          method: IdentifierType.KERI,
          displayName: metadata.displayName,
          createdAtUTC: metadata.createdAt.toISOString(),
          colors: metadata.colors,
          theme: metadata.theme,
          s: aid.state.s,
          dt: aid.state.dt,
          kt: aid.state.kt,
          k: aid.state.k,
          nt: aid.state.nt,
          n: aid.state.n,
          bt: aid.state.bt,
          b: aid.state.b,
          di: aid.state.di,
        },
      };
    }
  }

  async createIdentifier(
    metadata: Omit<
      IdentifierMetadataRecordProps,
      "id" | "createdAt" | "isArchived"
    >
  ): Promise<string | undefined> {
    const type = metadata.method;
    if (type === IdentifierType.KERI) {
      const { signifyName, identifier } =
        await this.agent.modules.signify.createIdentifier();
      await this.createIdentifierMetadataRecord({
        id: identifier,
        ...metadata,
        signifyName: signifyName,
      });
      return identifier;
    }

    const result = await this.agent.dids.create({
      method: type,
      options: { keyType: KeyType.Ed25519 },
    });
    if (!result.didState.did) {
      throw new Error(
        IdentifierService.UNEXPECTED_MISSING_DID_RESULT_ON_CREATE
      );
    }
    await this.createIdentifierMetadataRecord({
      id: result.didState.did,
      ...metadata,
    });
    return result.didState.did;
  }

  async archiveIdentifier(identifier: string): Promise<void> {
    return this.agent.modules.generalStorage.archiveIdentifierMetadata(
      identifier
    );
  }

  async deleteIdentifier(identifier: string): Promise<void> {
    const metadata = await this.getMetadataById(identifier);
    this.validArchivedIdentifier(metadata);
    await this.agent.modules.generalStorage.deleteIdentifierMetadata(
      identifier
    );
  }

  async restoreIdentifier(identifier: string): Promise<void> {
    const metadata = await this.getMetadataById(identifier);
    this.validArchivedIdentifier(metadata);
    return this.agent.modules.generalStorage.updateIdentifierMetadata(
      identifier,
      { isArchived: false }
    );
  }

  async updateIdentifier(
    identifier: string,
    data: Pick<IdentifierMetadataRecordProps, "theme" | "displayName">
  ): Promise<void> {
    const metadata = await this.getMetadataById(identifier);
    this.validIdentifierMetadata(metadata);
    return this.agent.modules.generalStorage.updateIdentifierMetadata(
      identifier,
      { theme: data.theme, displayName: data.displayName }
    );
  }

  private async getMetadataById(id: string): Promise<IdentifierMetadataRecord> {
    const metadata =
      await this.agent.modules.generalStorage.getIdentifierMetadata(id);
    if (!metadata) {
      throw new Error(
        `${IdentifierService.IDENTIFIER_METADATA_RECORD_MISSING} ${id}`
      );
    }
    return metadata;
  }

  private async createIdentifierMetadataRecord(
    data: IdentifierMetadataRecordProps
  ) {
    this.validIdentifierMetadata(data);
    const record = new IdentifierMetadataRecord({
      id: data.id,
      displayName: data.displayName,
      colors: data.colors,
      method: data.method,
      signifyName: data.signifyName,
      theme: data.theme,
    });
    return this.agent.modules.generalStorage.saveIdentifierMetadataRecord(
      record
    );
  }

  private isDidIdentifier(identifier: string): boolean {
    return identifier.startsWith("did:");
  }

  private async getIdentifierFromDidKeyRecord(
    record: DidRecord
  ): Promise<DIDDetails> {
    const didDoc = (await this.agent.dids.resolve(record.did)).didDocument;
    if (!didDoc) {
      throw new Error(`${IdentifierService.DID_MISSING_DID_DOC} ${record.did}`);
    }

    if (!(didDoc.verificationMethod && didDoc.verificationMethod.length)) {
      throw new Error(
        `${IdentifierService.UNEXPECTED_DID_DOC_FORMAT} ${record.did}`
      );
    }
    const signingKey = didDoc.verificationMethod[0];
    if (!signingKey.publicKeyBase58) {
      throw new Error(
        `${IdentifierService.UNEXPECTED_DID_DOC_FORMAT} ${record.did}`
      );
    }

    // @TODO - foconnor: We should get this first in case it doesn't exist and fail fast.
    const metadata = await this.getMetadataById(record.did);

    return {
      id: record.did,
      method: IdentifierType.KEY,
      displayName: metadata.displayName,
      createdAtUTC: record.createdAt.toISOString(),
      colors: metadata.colors,
      theme: metadata.theme,
      controller: record.did,
      keyType: signingKey.type.toString(),
      publicKeyBase58: signingKey.publicKeyBase58,
    };
  }

  private validArchivedIdentifier(metadata: IdentifierMetadataRecord): void {
    if (!metadata.isArchived) {
      throw new Error(
        `${IdentifierService.IDENTIFIER_NOT_ARCHIVED} ${metadata.id}`
      );
    }
  }

  private validIdentifierMetadata(
    metadata: IdentifierMetadataRecordProps
  ): void {
    if (
      metadata.theme &&
      !identifierTypeMappingTheme[metadata.method].includes(metadata.theme)
    ) {
      throw new Error(
        `${IdentifierService.THEME_WAS_NOT_VALID} ${metadata.id}`
      );
    }
  }
}

export { IdentifierService };
