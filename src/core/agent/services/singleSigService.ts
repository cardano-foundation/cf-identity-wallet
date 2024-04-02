import { v4 as uuidv4 } from "uuid";
import { IdentifierResult } from "../agent.types";
import {
  IdentifierMetadataRecord,
  IdentifierMetadataRecordProps,
} from "../records";
import { AgentService } from "./agentService";
import {
  GetIdentifierResult,
  IdentifierShortDetails,
  IdentifierType,
} from "./singleSig.types";

const identifierTypeMappingTheme: Record<IdentifierType, number[]> = {
  [IdentifierType.KERI]: [0, 1],
};

class SingleSigService extends AgentService {
  static readonly IDENTIFIER_NOT_ARCHIVED = "Identifier was not archived";
  static readonly THEME_WAS_NOT_VALID = "Identifier theme was not valid";

  async getIdentifiers(getArchived = false): Promise<IdentifierShortDetails[]> {
    const identifiers: IdentifierShortDetails[] = [];
    const listMetadata: IdentifierMetadataRecord[] =
      await this.identifierStorage.getAllIdentifierMetadata(getArchived);

    for (let i = 0; i < listMetadata.length; i++) {
      const metadata = listMetadata[i];
      identifiers.push({
        method: metadata.method,
        displayName: metadata.displayName,
        id: metadata.id,
        signifyName: metadata.signifyName,
        createdAtUTC: metadata.createdAt.toISOString(),
        colors: metadata.colors,
        theme: metadata.theme,
        isPending: metadata.isPending ?? false,
      });
    }
    return identifiers;
  }

  async getIdentifier(id: string): Promise<GetIdentifierResult | undefined> {
    const metadata = await this.identifierStorage.getIdentifierMetadata(id);
    const aid = await this.signifyClient
      .identifiers()
      .get(metadata.signifyName as string);
    if (metadata.isPending && metadata.signifyOpName) {
      return undefined;
    }
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
        signifyName: metadata.signifyName,
        colors: metadata.colors,
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
      },
    };
  }

  async createIdentifier(
    metadata: Omit<
      IdentifierMetadataRecordProps,
      "id" | "createdAt" | "isArchived"
    >
  ): Promise<string | undefined> {
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
    return identifier;
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
          method: IdentifierType.KERI,
          colors: ["#e0f5bc", "#ccef8f"],
          theme: 0,
          signifyName: identifier.name,
        });
      }
    }
  }

  private validArchivedIdentifier(metadata: IdentifierMetadataRecord): void {
    if (!metadata.isArchived) {
      throw new Error(
        `${SingleSigService.IDENTIFIER_NOT_ARCHIVED} ${metadata.id}`
      );
    }
  }

  private validIdentifierMetadata(
    metadata: Pick<IdentifierMetadataRecordProps, "theme" | "method">
  ): void {
    if (
      metadata.theme &&
      !identifierTypeMappingTheme[metadata.method].includes(metadata.theme)
    ) {
      throw new Error(`${SingleSigService.THEME_WAS_NOT_VALID}`);
    }
  }
}

export { SingleSigService };
