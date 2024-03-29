import { DidRecord, KeyType, utils } from "@aries-framework/core";
import {
  DIDDetails,
  GetIdentifierResult,
  IdentifierShortDetails,
  IdentifierType,
  MultiSigIcpRequestDetails,
} from "./identifierService.types";
import {
  IdentifierMetadataRecord,
  IdentifierMetadataRecordProps,
} from "../modules/generalStorage/repositories/identifierMetadataRecord";
import { AgentService } from "./agentService";
import {
  Aid,
  IdentifierResult,
  MultiSigExnMessage,
  NotificationRoute,
} from "../modules/signify/signifyApi.types";
import {
  ConnectionShortDetails,
  ConnectionType,
  KeriNotification,
} from "../agent.types";
import { AriesAgent } from "../agent";
import { RecordType } from "../../storage/storage.types";

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
  static readonly EXN_MESSAGE_NOT_FOUND =
    "There's no exchange message for the given SAID";
  static readonly ONLY_ALLOW_KERI_CONTACTS =
    "Can only create multi-sig using KERI contacts with specified OOBI URLs";
  static readonly ONLY_CREATE_DELAGATION_WITH_AID =
    "Can only create delegation using KERI AID";
  static readonly AID_MISSING_SIGNIFY_NAME =
    "Metadata record for KERI AID is missing the Signify name";
  static readonly ONLY_CREATE_ROTATION_WITH_AID =
    "Can only create rotation using KERI AID";
  static readonly MULTI_SIG_NOT_FOUND =
    "There's no multi sig identifier for the given SAID";
  static readonly AID_IS_NOT_MULTI_SIG =
    "This AID is not a multi sig identifier";
  static readonly NOT_FOUND_ALL_MEMBER_OF_MULTISIG =
    "Cannot find all members of multisig or one of the members does not rotate its AID";
  static readonly CANNOT_JOIN_MULTISIG_ICP =
    "Cannot join multi-sig inception as we do not control any member AID of the multi-sig";
  static readonly UNKNOWN_AIDS_IN_MULTISIG_ICP =
    "Multi-sig join request contains unknown AIDs (not connected)";

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
        signifyName: metadata.signifyName,
        createdAtUTC: metadata.createdAt.toISOString(),
        colors: metadata.colors,
        theme: metadata.theme,
        isPending: metadata.isPending ?? false,
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
      const aid = await this.signifyApi.getIdentifierByName(
        metadata.signifyName as string
      );
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
  }

  //Update multisig's status
  async checkMultisigComplete(identifier: string): Promise<boolean> {
    const metadata = await this.getMetadataById(identifier);
    const markMultisigResult = await this.markMultisigCompleteIfReady(metadata);
    return markMultisigResult.done;
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
        await this.signifyApi.createIdentifier();
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
    if (metadata.method === IdentifierType.KERI) {
      await this.agent.modules.generalStorage.updateIdentifierMetadata(
        identifier,
        {
          ...metadata,
          isDeleted: true,
        }
      );
    } else {
      await this.agent.modules.generalStorage.deleteIdentifierMetadata(
        identifier
      );
    }
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

  async syncKeriaIdentifiers() {
    const { aids: signifyIdentifiers } =
      await this.signifyApi.getAllIdentifiers();
    const storageIdentifiers =
      await this.agent.modules.generalStorage.getKeriIdentifiersMetadata();
    const unSyncedData = signifyIdentifiers.filter(
      (identifier: IdentifierResult) =>
        !storageIdentifiers.find((item) => identifier.prefix === item.id)
    );
    if (unSyncedData.length) {
      //sync the storage with the signify data
      for (const identifier of unSyncedData) {
        await this.createIdentifierMetadataRecord({
          id: identifier.prefix,
          displayName: identifier.prefix, //same as the id at the moment
          method: IdentifierType.KERI,
          colors: ["#e0f5bc", "#ccef8f"],
          theme: 4,
          signifyName: identifier.name,
        });
      }
    }
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
      ...data,
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
      isPending: false,
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

  async createMultisig(
    ourIdentifier: string,
    otherIdentifierContacts: ConnectionShortDetails[],
    meta: Pick<
      IdentifierMetadataRecordProps,
      "displayName" | "colors" | "theme"
    >,
    threshold: number,
    delegateContact?: ConnectionShortDetails
  ): Promise<string | undefined> {
    const ourMetadata = await this.getMetadataById(ourIdentifier);
    this.validIdentifierMetadata(ourMetadata);
    const ourAid = (await this.signifyApi.getIdentifierByName(
      ourMetadata.signifyName as string
    )) as Aid;
    //Make sure no non-Keri contacts get passed into this function
    const nonKeriContact = otherIdentifierContacts.find(
      (contact) => !contact.oobi || contact.type !== ConnectionType.KERI
    );
    if (nonKeriContact) {
      throw new Error(IdentifierService.ONLY_ALLOW_KERI_CONTACTS);
    }
    const otherAids = await Promise.all(
      otherIdentifierContacts.map(async (contact) => {
        const aid = await this.signifyApi.resolveOobi(contact.oobi as string);
        return { state: aid.response };
      })
    );
    let delegateAid;
    if (delegateContact) {
      const delegator = await this.signifyApi.resolveOobi(
        delegateContact.oobi as string
      );
      delegateAid = { state: delegator.response } as Aid;
    }

    const signifyName = utils.uuid();
    const result = await this.signifyApi.createMultisig(
      ourAid,
      otherAids,
      signifyName,
      threshold,
      delegateAid
    );
    const multisigId = result.op.name.split(".")[1];
    //this will be updated once the operation is done
    let isPending = true;
    if (result.op.done || threshold === 1) {
      isPending = false;
    }
    await this.createIdentifierMetadataRecord({
      id: multisigId,
      displayName: meta.displayName,
      method: IdentifierType.KERI,
      colors: meta.colors,
      theme: meta.theme,
      signifyName,
      signifyOpName: result.op.name, //we save the signifyOpName here to sync the multisig's status later
      isPending,
      multisigManageAid: ourIdentifier,
    });
    return multisigId;
  }

  async rotateMultisig(ourIdentifier: string): Promise<string> {
    const metadata = await this.getMetadataById(ourIdentifier);
    if (metadata.method !== IdentifierType.KERI) {
      throw new Error(IdentifierService.ONLY_CREATE_ROTATION_WITH_AID);
    }

    if (!metadata.multisigManageAid) {
      throw new Error(IdentifierService.AID_IS_NOT_MULTI_SIG);
    }
    const identifierManageAid = await this.getMetadataById(
      metadata.multisigManageAid
    );

    if (!metadata.signifyName || !identifierManageAid.signifyName) {
      throw new Error(IdentifierService.AID_MISSING_SIGNIFY_NAME);
    }
    const multiSig = await this.signifyApi.getIdentifierByName(
      metadata.signifyName
    );
    if (!multiSig) {
      throw new Error(IdentifierService.MULTI_SIG_NOT_FOUND);
    }
    const nextSequence = (Number(multiSig.state.s) + 1).toString();

    const members = await this.signifyApi.getMultisigMembers(
      metadata.signifyName
    );
    const multisigMembers = members?.signing;

    const multisigMumberAids: Aid[] = [];
    await Promise.allSettled(
      multisigMembers.map(async (signing: any) => {
        const aid = await this.signifyApi.queryKeyState(
          signing.aid,
          nextSequence
        );
        if (aid.done) {
          multisigMumberAids.push({ state: aid.response } as Aid);
        }
      })
    );
    if (multisigMembers.length !== multisigMumberAids.length) {
      throw new Error(IdentifierService.NOT_FOUND_ALL_MEMBER_OF_MULTISIG);
    }
    const aid = await this.signifyApi.getIdentifierByName(
      identifierManageAid?.signifyName
    );

    const result = await this.signifyApi.rotateMultisigAid(
      aid,
      multisigMumberAids,
      metadata.signifyName
    );
    const multisigId = result.op.name.split(".")[1];
    return multisigId;
  }

  async joinMultisigRotation(notification: KeriNotification): Promise<string> {
    const msgSaid = notification.a.d as string;
    const notifications: MultiSigExnMessage[] =
      await this.signifyApi.getMultisigMessageBySaid(msgSaid);
    if (!notifications.length) {
      throw new Error(IdentifierService.EXN_MESSAGE_NOT_FOUND);
    }
    const exn = notifications[0].exn;
    const multisigId = exn.a.gid;
    const multiSig = await this.getMetadataById(multisigId);
    if (!multiSig) {
      throw new Error(IdentifierService.MULTI_SIG_NOT_FOUND);
    }
    if (!multiSig.multisigManageAid) {
      throw new Error(IdentifierService.AID_IS_NOT_MULTI_SIG);
    }
    const identifierManageAid = await this.getMetadataById(
      multiSig.multisigManageAid
    );

    if (!multiSig.signifyName || !identifierManageAid.signifyName) {
      throw new Error(IdentifierService.AID_MISSING_SIGNIFY_NAME);
    }

    const aid = await this.signifyApi.getIdentifierByName(
      identifierManageAid.signifyName
    );
    const res = await this.signifyApi.joinMultisigRotation(
      exn,
      aid,
      multiSig.signifyName
    );
    await this.basicStorage.deleteById(notification.id);
    return res.op.name.split(".")[1];
  }

  private async hasJoinedMultisig(msgSaid: string): Promise<boolean> {
    const notifications: MultiSigExnMessage[] =
      await this.signifyApi.getMultisigMessageBySaid(msgSaid);
    if (!notifications.length) {
      return false;
    }
    const exn = notifications[0].exn;
    const multisigId = exn.a.gid;
    try {
      const multiSig = await this.signifyApi.getIdentifierById(multisigId);
      if (multiSig) {
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  async getMultisigIcpDetails(
    notification: KeriNotification
  ): Promise<MultiSigIcpRequestDetails> {
    const msgSaid = notification.a.d as string;
    const icpMsg: MultiSigExnMessage[] =
      await this.signifyApi.getMultisigMessageBySaid(msgSaid);

    if (!icpMsg.length) {
      throw new Error(`${IdentifierService.EXN_MESSAGE_NOT_FOUND} ${msgSaid}`);
    }

    const senderAid = icpMsg[0].exn.i;
    // @TODO - foconnor: This cross service call should be handled better.
    const senderContact =
      await AriesAgent.agent.connections.getConnectionKeriShortDetailById(
        icpMsg[0].exn.i
      );

    const smids = icpMsg[0].exn.a.smids;
    // @TODO - foconnor: These searches should be optimised, revisit.
    const ourIdentifiers = await this.getIdentifiers();
    const ourConnections = await AriesAgent.agent.connections.getConnections();

    let ourIdentifier;
    const otherConnections = [];
    for (const member of smids) {
      if (member === senderAid) {
        continue;
      }

      if (!ourIdentifier) {
        const identifier = ourIdentifiers.find(
          (identifier) => identifier.id === member
        );
        if (identifier) {
          ourIdentifier = identifier;
          continue;
        }
      }

      for (const connection of ourConnections) {
        if (connection.id === member) {
          otherConnections.push(connection);
        }
      }
    }

    if (!ourIdentifier) {
      throw new Error(IdentifierService.CANNOT_JOIN_MULTISIG_ICP);
    }

    if (otherConnections.length !== smids.length - 2) {
      // Should be 2 less for us and the sender
      throw new Error(IdentifierService.UNKNOWN_AIDS_IN_MULTISIG_ICP);
    }

    return {
      ourIdentifier,
      sender: senderContact,
      otherConnections,
      threshold: parseInt(icpMsg[0].exn.e.icp.kt),
    };
  }

  async joinMultisig(
    notification: KeriNotification,
    meta: Pick<
      IdentifierMetadataRecordProps,
      "displayName" | "colors" | "theme"
    >
  ): Promise<string | undefined> {
    // @TODO - foconnor: getMultisigDetails already has much of this done so this method signature could be adjusted.
    const msgSaid = notification.a.d as string;
    const hasJoined = await this.hasJoinedMultisig(msgSaid);
    if (hasJoined) {
      await this.basicStorage.deleteById(notification.id);
      return;
    }
    const icpMsg: MultiSigExnMessage[] =
      await this.signifyApi.getMultisigMessageBySaid(msgSaid);

    if (!icpMsg.length) {
      throw new Error(`${IdentifierService.EXN_MESSAGE_NOT_FOUND} ${msgSaid}`);
    }
    const exn = icpMsg[0].exn;
    const smids = exn.a.smids;
    const identifiers = await this.getIdentifiers();
    const identifier = identifiers.find((identifier) => {
      return smids.find((member) => identifier.id === member);
    });

    if (!identifier) {
      throw new Error(IdentifierService.CANNOT_JOIN_MULTISIG_ICP);
    }

    if (!identifier.signifyName) {
      throw new Error(IdentifierService.AID_MISSING_SIGNIFY_NAME);
    }

    const aid = await this.signifyApi.getIdentifierByName(
      identifier?.signifyName
    );
    const signifyName = utils.uuid();
    const res = await this.signifyApi.joinMultisig(exn, aid, signifyName);
    await this.basicStorage.deleteById(notification.id);
    const multisigId = res.op.name.split(".")[1];
    await this.createIdentifierMetadataRecord({
      id: multisigId,
      displayName: meta.displayName,
      method: IdentifierType.KERI,
      colors: meta.colors,
      theme: meta.theme,
      signifyName,
      signifyOpName: res.op.name, //we save the signifyOpName here to sync the multisig's status later
      isPending: res.op.done ? false : true, //this will be updated once the operation is done
      multisigManageAid: identifier.id,
    });
    return multisigId;
  }

  async markMultisigCompleteIfReady(metadata: IdentifierMetadataRecord) {
    if (!metadata.signifyOpName || !metadata.isPending) {
      return {
        done: true,
      };
    }
    const pendingOperation = await this.signifyApi.getOpByName(
      metadata.signifyOpName
    );
    if (pendingOperation && pendingOperation.done) {
      await this.agent.modules.generalStorage.updateIdentifierMetadata(
        metadata.id,
        { isPending: false }
      );
      return { done: true };
    }
    return { done: false };
  }

  async getUnhandledMultisigIdentifiers(): Promise<KeriNotification[]> {
    const results = await this.basicStorage.findAllByQuery(
      RecordType.NOTIFICATION_KERI,
      {
        route: NotificationRoute.MultiSigIcp,
        $or: [
          { route: NotificationRoute.MultiSigIcp },
          {
            route: NotificationRoute.MultiSigRot,
          },
        ],
      }
    );
    return results.map((result) => {
      return {
        id: result.id,
        createdAt: result.createdAt,
        a: result.content,
      };
    });
  }

  async createDelegatedIdentifier(
    metadata: Omit<
      IdentifierMetadataRecordProps,
      "id" | "createdAt" | "isArchived"
    >,
    delegatorPrefix: string
  ): Promise<string | undefined> {
    if (metadata.method !== IdentifierType.KERI) {
      throw new Error(IdentifierService.ONLY_CREATE_DELAGATION_WITH_AID);
    }
    const { signifyName, identifier } =
      await this.signifyApi.createDelegationIdentifier(delegatorPrefix);
    await this.createIdentifierMetadataRecord({
      id: identifier,
      ...metadata,
      signifyName: signifyName,
      method: IdentifierType.KERI,
      isPending: true,
    });
    return identifier;
  }

  async approveDelegation(
    signifyName: string,
    delegatePrefix: string
  ): Promise<void> {
    await this.signifyApi.interactDelegation(signifyName, delegatePrefix);
  }

  async checkDelegationSuccess(
    metadata: IdentifierMetadataRecord
  ): Promise<boolean> {
    if (!metadata.signifyName) {
      throw new Error(IdentifierService.AID_MISSING_SIGNIFY_NAME);
    }
    if (!metadata.isPending) {
      return true;
    }
    const isDone = await this.signifyApi.delegationApproved(
      metadata.signifyName
    );
    if (isDone) {
      await this.agent.modules.generalStorage.updateIdentifierMetadata(
        metadata.id,
        { isPending: false }
      );
    }
    return isDone;
  }

  async rotateIdentifier(metadata: IdentifierMetadataRecord) {
    if (metadata.method !== IdentifierType.KERI) {
      throw new Error(IdentifierService.ONLY_CREATE_ROTATION_WITH_AID);
    }
    if (!metadata.signifyName) {
      throw new Error(IdentifierService.AID_MISSING_SIGNIFY_NAME);
    }
    await this.signifyApi.rotateIdentifier(metadata.signifyName);
  }
}

export { IdentifierService };
