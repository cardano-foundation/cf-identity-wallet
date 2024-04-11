import { Algos, d, EventResult, messagize, Serder, Siger } from "signify-ts";
import { v4 as uuidv4 } from "uuid";
import { Agent } from "../agent";
import {
  ConnectionShortDetails,
  KeriNotification,
  Aid,
  IdentifierResult,
  MultiSigExnMessage,
  MultiSigRoute,
  NotificationRoute,
  CreateIdentifierResult,
  CreateMultisigExnPayload,
} from "../agent.types";
import {
  IdentifierMetadataRecord,
  IdentifierMetadataRecordProps,
} from "../records";
import { AgentService } from "./agentService";
import { MultiSigIcpRequestDetails } from "./identifier.types";
import { waitAndGetDoneOp } from "./utils";
import { RecordType } from "../../storage/storage.types";

class MultiSigService extends AgentService {
  static readonly FAILED_TO_RESOLVE_OOBI =
    "Failed to resolve OOBI, operation not completing...";
  static readonly INVALID_THRESHOLD = "Invalid threshold";
  static readonly CANNOT_GET_KEYSTATES_FOR_MULTISIG_MEMBER =
    "Unable to retrieve key states for given multi-sig member";
  static readonly EXN_MESSAGE_NOT_FOUND =
    "There's no exchange message for the given SAID";
  static readonly ONLY_ALLOW_KERI_CONTACTS =
    "Can only create multi-sig using KERI contacts with specified OOBI URLs";
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

  async createMultisig(
    ourIdentifier: string,
    otherIdentifierContacts: ConnectionShortDetails[],
    meta: Pick<
      IdentifierMetadataRecordProps,
      "displayName" | "colors" | "theme"
    >,
    threshold: number,
    delegateContact?: ConnectionShortDetails
  ): Promise<CreateIdentifierResult> {
    const ourMetadata = await this.identifierStorage.getIdentifierMetadata(
      ourIdentifier
    );
    const ourAid: Aid = await this.signifyClient
      .identifiers()
      .get(ourMetadata.signifyName as string);
    const otherAids = await Promise.all(
      otherIdentifierContacts.map(async (contact) => {
        const aid = await Agent.agent.connections.resolveOobi(
          contact.oobi as string
        );
        return { state: aid.response };
      })
    );
    let delegateAid;
    if (delegateContact) {
      const delegator = await Agent.agent.connections.resolveOobi(
        delegateContact.oobi as string
      );
      delegateAid = { state: delegator.response } as Aid;
    }

    const signifyName = uuidv4();
    const result = await this.createAidMultisig(
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
    await this.identifierStorage.createIdentifierMetadataRecord({
      id: multisigId,
      displayName: meta.displayName,
      colors: meta.colors,
      theme: meta.theme,
      signifyName,
      signifyOpName: result.op.name, //we save the signifyOpName here to sync the multisig's status later
      isPending,
      multisigManageAid: ourIdentifier,
    });
    return { identifier: multisigId, signifyName };
  }

  async createAidMultisig(
    aid: Aid,
    otherAids: Pick<Aid, "state">[],
    name: string,
    threshold: number,
    delegate?: Aid
  ): Promise<{
    op: any;
    icpResult: EventResult;
    name: string;
  }> {
    if (threshold < 1 || threshold > otherAids.length + 1) {
      throw new Error(MultiSigService.INVALID_THRESHOLD);
    }
    const states = [aid["state"], ...otherAids.map((aid) => aid["state"])];
    const icp = await this.signifyClient.identifiers().create(name, {
      algo: Algos.group,
      mhab: aid,
      isith: threshold,
      nsith: threshold,
      toad: aid.state.b.length,
      wits: aid.state.b,
      states: states,
      rstates: states,
      delpre: delegate?.prefix,
    });
    const op = await icp.op();
    const serder = icp.serder;

    const sigs = icp.sigs;
    const sigers = sigs.map((sig: string) => new Siger({ qb64: sig }));

    const ims = d(messagize(serder, sigers));
    const atc = ims.substring(serder.size);
    const embeds = {
      icp: [serder, atc],
    };

    const smids = states.map((state) => state["i"]);
    const recp = otherAids
      .map((aid) => aid["state"])
      .map((state) => state["i"]);
    await this.sendMultisigExn(
      aid["name"],
      aid,
      MultiSigRoute.ICP,
      embeds,
      recp,
      {
        gid: serder.pre,
        smids: smids,
        rmids: smids,
        rstates: states,
        name,
      }
    );
    return {
      op: op,
      icpResult: icp,
      name: name,
    };
  }

  async rotateMultisig(ourIdentifier: string): Promise<string> {
    const metadata = await this.identifierStorage.getIdentifierMetadata(
      ourIdentifier
    );
    if (!metadata.multisigManageAid) {
      throw new Error(MultiSigService.AID_IS_NOT_MULTI_SIG);
    }
    const identifierManageAid =
      await this.identifierStorage.getIdentifierMetadata(
        metadata.multisigManageAid
      );

    const multiSig = await this.signifyClient
      .identifiers()
      .get(metadata.signifyName);
    if (!multiSig) {
      throw new Error(MultiSigService.MULTI_SIG_NOT_FOUND);
    }
    const nextSequence = (Number(multiSig.state.s) + 1).toString();

    const members = await this.signifyClient
      .identifiers()
      .members(metadata.signifyName);
    const multisigMembers = members?.signing;

    const multisigMumberAids: Aid[] = [];
    await Promise.allSettled(
      multisigMembers.map(async (signing: any) => {
        const aid = await this.signifyClient
          .keyStates()
          .query(signing.aid, nextSequence);
        if (aid.done) {
          multisigMumberAids.push({ state: aid.response } as Aid);
        }
      })
    );
    if (multisigMembers.length !== multisigMumberAids.length) {
      throw new Error(MultiSigService.NOT_FOUND_ALL_MEMBER_OF_MULTISIG);
    }
    const aid = await this.signifyClient
      .identifiers()
      .get(identifierManageAid?.signifyName);

    const result = await this.rotateMultisigAid(
      aid,
      multisigMumberAids,
      metadata.signifyName
    );
    const multisigId = result.op.name.split(".")[1];
    return multisigId;
  }

  async joinMultisigRotation(notification: KeriNotification): Promise<string> {
    const msgSaid = notification.a.d as string;
    const notifications: MultiSigExnMessage[] = await this.signifyClient
      .groups()
      .getRequest(msgSaid);
    if (!notifications.length) {
      throw new Error(MultiSigService.EXN_MESSAGE_NOT_FOUND);
    }
    const exn = notifications[0].exn;
    const multisigId = exn.a.gid;
    const multiSig = await this.identifierStorage.getIdentifierMetadata(
      multisigId
    );
    if (!multiSig) {
      throw new Error(MultiSigService.MULTI_SIG_NOT_FOUND);
    }
    if (!multiSig.multisigManageAid) {
      throw new Error(MultiSigService.AID_IS_NOT_MULTI_SIG);
    }
    const identifierManageAid =
      await this.identifierStorage.getIdentifierMetadata(
        multiSig.multisigManageAid
      );

    const aid = await this.signifyClient
      .identifiers()
      .get(identifierManageAid.signifyName);
    const res = await this.joinMultisigRotationKeri(
      exn,
      aid,
      multiSig.signifyName
    );
    await this.basicStorage.deleteById(notification.id);
    return res.op.name.split(".")[1];
  }

  private async hasJoinedMultisig(msgSaid: string): Promise<boolean> {
    const notifications: MultiSigExnMessage[] = await this.signifyClient
      .groups()
      .getRequest(msgSaid);
    if (!notifications.length) {
      return false;
    }
    const exn = notifications[0].exn;
    const multisigId = exn.a.gid;
    try {
      const multiSig = await this.getIdentifierById(multisigId);
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
    const icpMsg: MultiSigExnMessage[] = await this.signifyClient
      .groups()
      .getRequest(msgSaid);

    if (!icpMsg.length) {
      throw new Error(`${MultiSigService.EXN_MESSAGE_NOT_FOUND} ${msgSaid}`);
    }

    const senderAid = icpMsg[0].exn.i;
    // @TODO - foconnor: This cross service call should be handled better.
    const senderContact =
      await Agent.agent.connections.getConnectionKeriShortDetailById(
        icpMsg[0].exn.i
      );

    const smids = icpMsg[0].exn.a.smids;
    // @TODO - foconnor: These searches should be optimised, revisit.
    const ourIdentifiers = await Agent.agent.identifiers.getIdentifiers();
    const ourConnections = await Agent.agent.connections.getConnections();

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
      throw new Error(MultiSigService.CANNOT_JOIN_MULTISIG_ICP);
    }

    if (otherConnections.length !== smids.length - 2) {
      // Should be 2 less for us and the sender
      throw new Error(MultiSigService.UNKNOWN_AIDS_IN_MULTISIG_ICP);
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
  ): Promise<CreateIdentifierResult | undefined> {
    // @TODO - foconnor: getMultisigDetails already has much of this done so this method signature could be adjusted.
    const msgSaid = notification.a.d as string;
    const hasJoined = await this.hasJoinedMultisig(msgSaid);
    if (hasJoined) {
      await this.basicStorage.deleteById(notification.id);
      return;
    }
    const icpMsg: MultiSigExnMessage[] = await this.signifyClient
      .groups()
      .getRequest(msgSaid);

    if (!icpMsg.length) {
      throw new Error(`${MultiSigService.EXN_MESSAGE_NOT_FOUND} ${msgSaid}`);
    }
    const exn = icpMsg[0].exn;
    const smids = exn.a.smids;
    const identifiers = await Agent.agent.identifiers.getIdentifiers();
    const identifier = identifiers.find((identifier) => {
      return smids.find((member) => identifier.id === member);
    });

    if (!identifier) {
      throw new Error(MultiSigService.CANNOT_JOIN_MULTISIG_ICP);
    }

    const aid = await this.signifyClient
      .identifiers()
      .get(identifier?.signifyName);
    const signifyName = uuidv4();
    const res = await this.joinMultisigKeri(exn, aid, signifyName);
    await this.basicStorage.deleteById(notification.id);
    const multisigId = res.op.name.split(".")[1];
    await this.identifierStorage.createIdentifierMetadataRecord({
      id: multisigId,
      displayName: meta.displayName,
      colors: meta.colors,
      theme: meta.theme,
      signifyName,
      signifyOpName: res.op.name, //we save the signifyOpName here to sync the multisig's status later
      isPending: res.op.done ? false : true, //this will be updated once the operation is done
      multisigManageAid: identifier.id,
    });
    return { identifier: multisigId, signifyName };
  }

  async markMultisigCompleteIfReady(metadata: IdentifierMetadataRecord) {
    if (!metadata.signifyOpName || !metadata.isPending) {
      return {
        done: true,
      };
    }
    const pendingOperation = await this.signifyClient
      .operations()
      .get(metadata.signifyOpName);
    if (pendingOperation && pendingOperation.done) {
      await this.identifierStorage.updateIdentifierMetadata(metadata.id, {
        isPending: false,
      });
      return { done: true };
    }
    return { done: false };
  }

  async getUnhandledMultisigIdentifiers(
    filters: {
      isDismissed?: boolean;
    } = {}
  ): Promise<KeriNotification[]> {
    const results = await this.basicStorage.findAllByQuery(
      RecordType.NOTIFICATION_KERI,
      {
        route: NotificationRoute.MultiSigIcp,
        ...filters,
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

  async rotateMultisigAid(
    aid: Aid,
    multisigAidMembers: Pick<Aid, "state">[],
    name: string
  ): Promise<{
    op: any;
    icpResult: EventResult;
  }> {
    const states = [...multisigAidMembers.map((aid) => aid["state"])];
    const icp = await this.signifyClient
      .identifiers()
      .rotate(name, { states: states, rstates: states });
    const op = await icp.op();
    const serder = icp.serder;

    const sigs = icp.sigs;
    const sigers = sigs.map((sig: string) => new Siger({ qb64: sig }));

    const ims = d(messagize(serder, sigers));
    const atc = ims.substring(serder.size);
    const embeds = {
      rot: [serder, atc],
    };

    const smids = states.map((state) => state["i"]);
    const recp = multisigAidMembers
      .map((aid) => aid["state"])
      .map((state) => state["i"]);

    await this.sendMultisigExn(
      aid["name"],
      aid,
      MultiSigRoute.ROT,
      embeds,
      recp,
      {
        gid: serder.pre,
        smids: smids,
        rmids: smids,
        rstates: states,
        name,
      }
    );
    return {
      op: op,
      icpResult: icp,
    };
  }

  async joinMultisigRotationKeri(
    exn: MultiSigExnMessage["exn"],
    aid: Aid,
    name: string
  ): Promise<{
    op: any;
    icpResult: EventResult;
    name: string;
  }> {
    const rstates = exn.a.rstates;
    const icpResult = await this.signifyClient
      .identifiers()
      .rotate(name, { states: rstates, rstates: rstates });
    const op = await icpResult.op();
    const serder = icpResult.serder;
    const sigs = icpResult.sigs;
    const sigers = sigs.map((sig: string) => new Siger({ qb64: sig }));

    const ims = d(messagize(serder, sigers));
    const atc = ims.substring(serder.size);
    const embeds = {
      rot: [serder, atc],
    };

    const smids = exn.a.smids;
    const recp = rstates
      .filter((r) => r.i !== aid.state.i)
      .map((state) => state["i"]);
    await this.sendMultisigExn(
      aid["name"],
      aid,
      MultiSigRoute.IXN,
      embeds,
      recp,
      {
        gid: serder.pre,
        smids: smids,
        rmids: smids,
        rstates,
        name,
      }
    );
    return {
      op: op,
      icpResult: icpResult,
      name: name,
    };
  }

  async getIdentifierById(id: string): Promise<IdentifierResult | undefined> {
    const allIdentifiers = await this.signifyClient.identifiers().list();
    const identifier = allIdentifiers.aids.find(
      (identifier: IdentifierResult) => identifier.prefix === id
    );
    return identifier;
  }

  async joinMultisigKeri(
    exn: MultiSigExnMessage["exn"],
    aid: Aid,
    name: string
  ): Promise<{
    op: any;
    icpResult: EventResult;
    name: string;
  }> {
    const icp = exn.e.icp;

    // @TODO - foconnor: We can skip our member and get state from aid param.
    const states = await Promise.all(
      exn.a.smids.map(async (member) => {
        const result = await this.signifyClient.keyStates().get(member);
        if (result.length === 0) {
          throw new Error(
            MultiSigService.CANNOT_GET_KEYSTATES_FOR_MULTISIG_MEMBER
          );
        }
        return result[0];
      })
    );

    // @TODO - foconnor: Check if smids === rmids, and if so, skip this.
    const rstates = await Promise.all(
      exn.a.rmids.map(async (member) => {
        const result = await this.signifyClient.keyStates().get(member);
        if (result.length === 0) {
          throw new Error(
            MultiSigService.CANNOT_GET_KEYSTATES_FOR_MULTISIG_MEMBER
          );
        }
        return result[0];
      })
    );
    const icpResult = await this.signifyClient.identifiers().create(name, {
      algo: Algos.group,
      mhab: aid,
      isith: icp.kt,
      nsith: icp.nt,
      toad: parseInt(icp.bt),
      wits: icp.b,
      states,
      rstates,
    });
    const op = await icpResult.op();
    const serder = icpResult.serder;
    const sigs = icpResult.sigs;
    const sigers = sigs.map((sig: string) => new Siger({ qb64: sig }));

    const ims = d(messagize(serder, sigers));
    const atc = ims.substring(serder.size);
    const embeds = {
      icp: [serder, atc],
    };

    const smids = exn.a.smids;
    const recp = states
      .filter((r) => r.i !== aid.state.i)
      .map((state) => state["i"]);
    await this.sendMultisigExn(
      aid["name"],
      aid,
      MultiSigRoute.ICP,
      embeds,
      recp,
      {
        gid: serder.pre,
        smids: smids,
        rmids: smids,
        rstates,
        name,
      }
    );
    return {
      op: op,
      icpResult: icpResult,
      name: name,
    };
  }

  async checkMultisigComplete(identifier: string): Promise<boolean> {
    const metadata = await this.identifierStorage.getIdentifierMetadata(
      identifier
    );
    const markMultisigResult = await this.markMultisigCompleteIfReady(metadata);
    return markMultisigResult.done;
  }

  private async sendMultisigExn(
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
    return this.signifyClient
      .exchanges()
      .send(name, "multisig", aid, route, payload, embeds, recp);
  }
}

export { MultiSigService };
