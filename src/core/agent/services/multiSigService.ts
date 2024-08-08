import {
  Algos,
  b,
  d,
  EventResult,
  messagize,
  Saider,
  Serder,
  Siger,
} from "signify-ts";
import { v4 as uuidv4 } from "uuid";
import { Agent } from "../agent";
import {
  IdentifierResult,
  NotificationRoute,
  CreateIdentifierResult,
  AgentServicesProps,
} from "../agent.types";
import type {
  KeriaNotification,
  ConnectionShortDetails,
  AuthorizationRequestExn,
} from "../agent.types";
import {
  IdentifierMetadataRecord,
  IdentifierMetadataRecordProps,
  IdentifierStorage,
  NotificationStorage,
  OperationPendingStorage,
} from "../records";
import { AgentService } from "./agentService";
import { MultiSigIcpRequestDetails } from "./identifier.types";
import {
  Aid,
  MultiSigRoute,
  MultiSigExnMessage,
  CreateMultisigExnPayload,
  AuthorizationExnPayload,
} from "./multiSig.types";
import { OnlineOnly, waitAndGetDoneOp } from "./utils";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { ConfigurationService } from "../../configuration";

class MultiSigService extends AgentService {
  static readonly INVALID_THRESHOLD = "Invalid threshold";
  static readonly CANNOT_GET_KEYSTATES_FOR_MULTISIG_MEMBER =
    "Unable to retrieve key states for given multi-sig member";
  static readonly CANNOT_GET_KEYSTATE_OF_IDENTIFIER =
    "Unable to query key state of identifier";
  static readonly EXN_MESSAGE_NOT_FOUND =
    "There's no exchange message for the given SAID";
  static readonly MULTI_SIG_NOT_FOUND =
    "There's no multi sig identifier for the given SAID";
  static readonly AID_IS_NOT_MULTI_SIG =
    "This AID is not a multi sig identifier";
  static readonly NOT_FOUND_ALL_MEMBER_OF_MULTISIG =
    "Cannot find all members of multisig or one of the members does not rotate its AID";
  static readonly UNKNOWN_AIDS_IN_MULTISIG_ICP =
    "Multi-sig join request contains unknown AIDs (not connected)";
  static readonly MISSING_GROUP_METADATA =
    "Metadata record for group is missing";
  static readonly ONLY_ALLOW_LINKED_CONTACTS =
    "Only allowed to create multi-sig using contacts with a matching groupId to our member identifier";
  static readonly ONLY_ALLOW_GROUP_INITIATOR =
    "Only the group initiator can create the multisig";
  static readonly GROUP_ALREADY_EXISTs = "Group already exists";
  static readonly MEMBER_AID_NOT_FOUND =
    "We do not control any member AID of the multi-sig";

  protected readonly identifierStorage: IdentifierStorage;
  protected readonly notificationStorage!: NotificationStorage;
  protected readonly operationPendingStorage: OperationPendingStorage;

  constructor(
    agentServiceProps: AgentServicesProps,
    identifierStorage: IdentifierStorage,
    notificationStorage: NotificationStorage,
    operationPendingStorage: OperationPendingStorage
  ) {
    super(agentServiceProps);
    this.identifierStorage = identifierStorage;
    this.notificationStorage = notificationStorage;
    this.operationPendingStorage = operationPendingStorage;
  }

  @OnlineOnly
  async createMultisig(
    ourIdentifier: string,
    otherIdentifierContacts: ConnectionShortDetails[],
    threshold: number,
    delegateContact?: ConnectionShortDetails
  ): Promise<CreateIdentifierResult> {
    if (threshold < 1 || threshold > otherIdentifierContacts.length + 1) {
      throw new Error(MultiSigService.INVALID_THRESHOLD);
    }
    const ourMetadata = await this.identifierStorage.getIdentifierMetadata(
      ourIdentifier
    );
    if (!ourMetadata.groupMetadata) {
      throw new Error(MultiSigService.MISSING_GROUP_METADATA);
    }
    if (!ourMetadata.groupMetadata.groupInitiator) {
      throw new Error(MultiSigService.ONLY_ALLOW_GROUP_INITIATOR);
    }
    if (ourMetadata.groupMetadata.groupCreated) {
      throw new Error(MultiSigService.GROUP_ALREADY_EXISTs);
    }
    const notLinkedContacts = otherIdentifierContacts.filter(
      (contact) => contact.groupId !== ourMetadata.groupMetadata?.groupId
    );
    if (notLinkedContacts.length) {
      throw new Error(MultiSigService.ONLY_ALLOW_LINKED_CONTACTS);
    }
    const ourAid: Aid = await this.props.signifyClient
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
    const op = result.op;
    const multisigId = op.name.split(".")[1];
    const isPending = !op.done;

    await this.identifierStorage.createIdentifierMetadataRecord({
      id: multisigId,
      displayName: ourMetadata.displayName,
      theme: ourMetadata.theme,
      signifyName,
      signifyOpName: result.op.name, //we save the signifyOpName here to sync the multisig's status later
      isPending,
      multisigManageAid: ourIdentifier,
    });
    ourMetadata.groupMetadata.groupCreated = true;
    await this.identifierStorage.updateIdentifierMetadata(
      ourMetadata.id,
      ourMetadata
    );
    if (isPending) {
      const pendingOperation = await this.operationPendingStorage.save({
        id: op.name,
        recordType: OperationPendingRecordType.Group,
      });
      Agent.agent.signifyNotifications.addPendingOperationToQueue(
        pendingOperation
      );
    } else {
      // Trigger the end role authorization if the operation is done
      await this.endRoleAuthorization(signifyName);
    }
    return { identifier: multisigId, signifyName, isPending };
  }

  private async createAidMultisig(
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
    const states = [aid["state"], ...otherAids.map((aid) => aid["state"])];
    const icp = await this.props.signifyClient.identifiers().create(name, {
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

  @OnlineOnly
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

    const multiSig = await this.props.signifyClient
      .identifiers()
      .get(metadata.signifyName)
      .catch((error) => {
        const errorStack = (error as Error).stack as string;
        const status = errorStack.split("-")[1];
        if (/404/gi.test(status) && /SignifyClient/gi.test(errorStack)) {
          return undefined;
        } else {
          throw error;
        }
      });
    if (!multiSig) {
      throw new Error(MultiSigService.MULTI_SIG_NOT_FOUND);
    }
    const nextSequence = (Number(multiSig.state.s) + 1).toString();

    const members = await this.props.signifyClient
      .identifiers()
      .members(metadata.signifyName);
    const smids = members?.signing;
    const rmids = members?.rotation;

    const states: any[] = [];
    const rstates: any[] = [];

    await Promise.allSettled(
      smids.map(async (signing: any) => {
        const aid = await this.props.signifyClient
          .keyStates()
          .query(signing.aid, nextSequence);
        if (aid.done) {
          states.push(aid.response);
        }
      })
    );

    await Promise.allSettled(
      rmids.map(async (rotation: any) => {
        const aid = await this.props.signifyClient
          .keyStates()
          .query(rotation.aid, nextSequence);
        if (aid.done) {
          rstates.push(aid.response);
        }
      })
    );

    if (smids.length !== states.length) {
      throw new Error(MultiSigService.NOT_FOUND_ALL_MEMBER_OF_MULTISIG);
    }
    const aid = await this.props.signifyClient
      .identifiers()
      .get(identifierManageAid?.signifyName);

    const result = await this.rotateMultisigAid(
      aid,
      smids,
      rmids,
      states,
      rstates,
      metadata.signifyName
    );
    const multisigId = result.op.name.split(".")[1];
    return multisigId;
  }

  @OnlineOnly
  async joinMultisigRotation(notification: KeriaNotification): Promise<string> {
    const msgSaid = notification.a.d as string;
    const notifications: MultiSigExnMessage[] = await this.props.signifyClient
      .groups()
      .getRequest(msgSaid)
      .catch((error) => {
        const errorStack = (error as Error).stack as string;
        const status = errorStack.split("-")[1];
        if (/404/gi.test(status) && /SignifyClient/gi.test(errorStack)) {
          return [];
        } else {
          throw error;
        }
      });
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

    const aid = await this.props.signifyClient
      .identifiers()
      .get(identifierManageAid.signifyName);
    const res = await this.joinMultisigRotationKeri(
      exn,
      aid,
      multiSig.signifyName
    );
    Agent.agent.signifyNotifications.deleteNotificationRecordById(
      notification.id,
      notification.a.r as NotificationRoute
    );
    return res.op.name.split(".")[1];
  }

  private async hasJoinedMultisig(msgSaid: string): Promise<boolean> {
    const notifications: MultiSigExnMessage[] = await this.props.signifyClient
      .groups()
      .getRequest(msgSaid)
      .catch((error) => {
        const errorStack = (error as Error).stack as string;
        const status = errorStack.split("-")[1];
        if (/404/gi.test(status) && /SignifyClient/gi.test(errorStack)) {
          return [];
        } else {
          throw error;
        }
      });
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

  @OnlineOnly
  async getMultisigIcpDetails(
    notificationSaid: string
  ): Promise<MultiSigIcpRequestDetails> {
    const icpMsg: MultiSigExnMessage[] = await this.props.signifyClient
      .groups()
      .getRequest(notificationSaid)
      .catch((error) => {
        const errorStack = (error as Error).stack as string;
        const status = errorStack.split("-")[1];
        if (/404/gi.test(status) && /SignifyClient/gi.test(errorStack)) {
          return [];
        } else {
          throw error;
        }
      });

    if (!icpMsg.length) {
      throw new Error(
        `${MultiSigService.EXN_MESSAGE_NOT_FOUND} ${notificationSaid}`
      );
    }

    const senderAid = icpMsg[0].exn.i;
    // @TODO - foconnor: This cross service call should be handled better.
    const senderContact =
      await Agent.agent.connections.getConnectionShortDetailById(
        icpMsg[0].exn.i
      );

    const smids = icpMsg[0].exn.a.smids;
    // @TODO - foconnor: These searches should be optimised, revisit.
    const ourIdentifiers = await Agent.agent.identifiers.getIdentifiers();

    const ourIdentifier = ourIdentifiers.find((identifier) =>
      smids.includes(identifier.id)
    );
    if (!ourIdentifier || !ourIdentifier.groupMetadata?.groupId) {
      throw new Error(MultiSigService.MEMBER_AID_NOT_FOUND);
    }

    const otherConnections = (
      await Agent.agent.connections.getMultisigLinkedContacts(
        ourIdentifier.groupMetadata.groupId
      )
    ).filter((connection) => connection.id !== senderAid);

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

  @OnlineOnly
  async joinMultisig(
    notificationId: string,
    notificationRoute: NotificationRoute,
    notificationSaid: string,
    meta: Pick<IdentifierMetadataRecordProps, "displayName" | "theme">
  ): Promise<CreateIdentifierResult | undefined> {
    // @TODO - foconnor: getMultisigDetails already has much of this done so this method signature could be adjusted.
    const hasJoined = await this.hasJoinedMultisig(notificationSaid);
    if (hasJoined) {
      Agent.agent.signifyNotifications.deleteNotificationRecordById(
        notificationId,
        notificationRoute
      );
      return;
    }
    const icpMsg: MultiSigExnMessage[] = await this.props.signifyClient
      .groups()
      .getRequest(notificationSaid)
      .catch((error) => {
        const errorStack = (error as Error).stack as string;
        const status = errorStack.split("-")[1];
        if (/404/gi.test(status) && /SignifyClient/gi.test(errorStack)) {
          return [];
        } else {
          throw error;
        }
      });

    if (!icpMsg.length) {
      throw new Error(
        `${MultiSigService.EXN_MESSAGE_NOT_FOUND} ${notificationSaid}`
      );
    }
    const exn = icpMsg[0].exn;
    const smids = exn.a.smids;
    const identifiers = await Agent.agent.identifiers.getIdentifiers();
    const identifier = identifiers.find((identifier) => {
      return smids.find((member) => identifier.id === member);
    });

    if (!identifier) {
      throw new Error(MultiSigService.MEMBER_AID_NOT_FOUND);
    }

    if (!identifier.groupMetadata) {
      throw new Error(MultiSigService.MISSING_GROUP_METADATA);
    }

    const aid = await this.props.signifyClient
      .identifiers()
      .get(identifier?.signifyName);
    const signifyName = uuidv4();
    const res = await this.joinMultisigKeri(exn, aid, signifyName);
    await this.notificationStorage.deleteById(notificationId);
    const op = res.op;
    const multisigId = op.name.split(".")[1];
    const isPending = !op.done;

    await this.identifierStorage.createIdentifierMetadataRecord({
      id: multisigId,
      displayName: meta.displayName,
      theme: meta.theme,
      signifyName,
      signifyOpName: op.name, //we save the signifyOpName here to sync the multisig's status later
      isPending,
      multisigManageAid: identifier.id,
    });
    identifier.groupMetadata.groupCreated = true;
    await this.identifierStorage.updateIdentifierMetadata(
      identifier.id,
      identifier
    );

    if (isPending) {
      const pendingOperation = await this.operationPendingStorage.save({
        id: op.name,
        recordType: OperationPendingRecordType.Group,
      });
      Agent.agent.signifyNotifications.addPendingOperationToQueue(
        pendingOperation
      );
    } else {
      // Trigger the end role authorization if the operation is done
      await this.endRoleAuthorization(signifyName);
    }

    return { identifier: multisigId, signifyName, isPending };
  }

  @OnlineOnly
  async markMultisigCompleteIfReady(metadata: IdentifierMetadataRecord) {
    if (!metadata.signifyOpName || !metadata.isPending) {
      return {
        done: true,
      };
    }
    const pendingOperation = await this.props.signifyClient
      .operations()
      .get(metadata.signifyOpName)
      .catch((error) => {
        const errorStack = (error as Error).stack as string;
        const status = errorStack.split("-")[1];
        if (/404/gi.test(status) && /SignifyClient/gi.test(errorStack)) {
          return undefined;
        } else {
          throw error;
        }
      });
    if (pendingOperation && pendingOperation.done) {
      await this.identifierStorage.updateIdentifierMetadata(metadata.id, {
        isPending: false,
      });
      return { done: true };
    }
    return { done: false };
  }

  async rotateLocalMember(multisigId: string) {
    const metadata = await this.identifierStorage.getIdentifierMetadata(
      multisigId
    );
    if (!metadata.multisigManageAid) {
      throw new Error(MultiSigService.AID_IS_NOT_MULTI_SIG);
    }
    await Agent.agent.identifiers.rotateIdentifier(metadata.multisigManageAid);
  }

  private async rotateMultisigAid(
    aid: Aid,
    smids: any[],
    rmids: any[],
    states: any[],
    rstates: any[],
    name: string
  ): Promise<{
    op: any;
    icpResult: EventResult;
  }> {
    const icp = await this.props.signifyClient
      .identifiers()
      .rotate(name, { states, rstates });

    const op = await icp.op();
    const serder = icp.serder;

    const sigs = icp.sigs;
    const sigers = sigs.map((sig: string) => new Siger({ qb64: sig }));

    const ims = d(messagize(serder, sigers));
    const atc = ims.substring(serder.size);
    const embeds = {
      rot: [serder, atc],
    };

    const recp = [
      ...new Set([
        ...smids.map((item) => item.aid),
        ...rmids.map((item) => item.aid),
      ]),
    ];

    await this.sendMultisigExn(
      aid["name"],
      aid,
      MultiSigRoute.ROT,
      embeds,
      recp,
      {
        gid: serder.pre,
        smids: smids,
        rmids: rmids,
        name,
      }
    );
    return {
      op: op,
      icpResult: icp,
    };
  }

  async membersReadyToRotate(identifierId: string): Promise<string[]> {
    const metadata = await this.identifierStorage.getIdentifierMetadata(
      identifierId
    );

    const multiSig = await this.props.signifyClient
      .identifiers()
      .get(metadata.signifyName);

    const members = await this.props.signifyClient
      .identifiers()
      .members(metadata?.signifyName);

    const nextSequence = (Number(multiSig.state.s) + 1).toString();
    const smids = members.signing;

    const states: any[] = [];
    await Promise.all(
      smids.map(async (signing: any) => {
        const op = await this.props.signifyClient
          .keyStates()
          .query(signing.aid, nextSequence);
        await waitAndGetDoneOp(this.props.signifyClient, op);

        if (op.done) {
          states.push(op.response);
        } else {
          throw new Error(MultiSigService.CANNOT_GET_KEYSTATE_OF_IDENTIFIER);
        }
      })
    );

    const rotated: string[] = [];
    for (const state of states) {
      if (!multiSig.state.k.includes(state.k[0])) {
        rotated.push(state.i);
      }
    }

    return rotated;
  }

  private async joinMultisigRotationKeri(
    exn: MultiSigExnMessage["exn"],
    aid: Aid,
    name: string
  ): Promise<{
    op: any;
    icpResult: EventResult;
    name: string;
  }> {
    const rstates = exn.a.rstates;
    const icpResult = await this.props.signifyClient
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
    const rmids = exn.a.rmids;
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
        rmids: rmids,
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

  private async getIdentifierById(
    id: string
  ): Promise<IdentifierResult | undefined> {
    const allIdentifiers = await this.props.signifyClient.identifiers().list();
    const identifier = allIdentifiers.aids.find(
      (identifier: IdentifierResult) => identifier.prefix === id
    );
    return identifier;
  }

  private async joinMultisigKeri(
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
        const result = await this.props.signifyClient.keyStates().get(member);
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
        const result = await this.props.signifyClient.keyStates().get(member);
        if (result.length === 0) {
          throw new Error(
            MultiSigService.CANNOT_GET_KEYSTATES_FOR_MULTISIG_MEMBER
          );
        }
        return result[0];
      })
    );
    const icpResult = await this.props.signifyClient
      .identifiers()
      .create(name, {
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

  private async sendMultisigExn(
    name: string,
    aid: Aid,
    route: MultiSigRoute,
    embeds: {
      icp?: (string | Serder)[];
      rot?: (string | Serder)[];
      rpy?: (string | Serder)[];
      ixn?: (string | Serder)[];
      exn?: (string | Serder)[];
    },
    recp: any,
    payload: CreateMultisigExnPayload | AuthorizationExnPayload
  ): Promise<any> {
    return this.props.signifyClient
      .exchanges()
      .send(name, "multisig", aid, route, payload, embeds, recp);
  }

  async hasMultisig(multisigId: string): Promise<boolean> {
    const multiSig = await this.identifierStorage
      .getIdentifierMetadata(multisigId)
      .catch((error) => {
        if (
          error.message === IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING
        ) {
          return undefined;
        } else {
          throw error;
        }
      });
    if (!multiSig) {
      return false;
    }
    return true;
  }

  private async getMultisigParticipants(multisigSignifyName: string) {
    const members = await this.props.signifyClient
      .identifiers()
      .members(multisigSignifyName);
    const multisigMembers = members["signing"];
    let ourIdentifier;
    for (const member of multisigMembers) {
      const identifier = await this.identifierStorage
        .getIdentifierMetadata(member.aid)
        .catch((error) => {
          if (
            error.message ===
            IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING
          ) {
            return undefined;
          } else {
            throw error;
          }
        });
      if (identifier && identifier.groupMetadata?.groupCreated) {
        ourIdentifier = identifier;
        break;
      }
    }
    if (!ourIdentifier) {
      throw new Error(MultiSigService.MEMBER_AID_NOT_FOUND);
    }
    return {
      ourIdentifier,
      multisigMembers,
    };
  }

  async endRoleAuthorization(multisigSignifyName: string): Promise<void> {
    const { ourIdentifier, multisigMembers } =
      await this.getMultisigParticipants(multisigSignifyName);
    const hab = await this.props.signifyClient
      .identifiers()
      .get(multisigSignifyName);
    const aid = hab["prefix"];
    const recp = multisigMembers
      .filter((signing: any) => signing.aid !== ourIdentifier.id)
      .map((member: any) => member.aid);
    const ourAid: Aid = await this.props.signifyClient
      .identifiers()
      .get(ourIdentifier.signifyName as string);
    for (const member of multisigMembers) {
      const eid = Object.keys(member.ends.agent)[0]; //agent of member
      const stamp = new Date().toISOString().replace("Z", "000+00:00");

      const endRoleRes = await this.props.signifyClient
        .identifiers()
        .addEndRole(multisigSignifyName, "agent", eid, stamp);
      await endRoleRes.op();
      const rpy = endRoleRes.serder;
      const sigs = endRoleRes.sigs;
      const mstate = hab["state"];
      const seal = [
        "SealEvent",
        { i: hab["prefix"], s: mstate["ee"]["s"], d: mstate["ee"]["d"] },
      ];
      const sigers = sigs.map((sig) => new Siger({ qb64: sig }));
      const roleims = d(
        messagize(rpy, sigers, seal, undefined, undefined, false)
      );
      const atc = roleims.substring(rpy.size);
      const roleEmbeds = {
        rpy: [rpy, atc],
      };

      await this.sendMultisigExn(
        ourIdentifier?.signifyName,
        ourAid,
        MultiSigRoute.RPY,
        roleEmbeds,
        recp,
        { gid: aid }
      );
    }
  }

  async joinAuthorization(requestExn: AuthorizationRequestExn): Promise<void> {
    const multisigAid = requestExn.a.gid;
    const multisigMetadataRecord =
      await this.identifierStorage.getIdentifierMetadata(multisigAid);
    const multisigSignifyName = multisigMetadataRecord.signifyName;
    // stamp, eid and role are provided in the exn message
    const rpystamp = requestExn.e.rpy.dt;
    const rpyrole = requestExn.e.rpy.a.role;
    const rpyeid = requestExn.e.rpy.a.eid;
    const endRoleRes = await this.props.signifyClient
      .identifiers()
      .addEndRole(multisigSignifyName, rpyrole, rpyeid, rpystamp);
    await endRoleRes.op();
    const rpy = endRoleRes.serder;
    const sigs = endRoleRes.sigs;

    const hab = await this.props.signifyClient
      .identifiers()
      .get(multisigSignifyName);
    const mstate = hab["state"];
    const seal = [
      "SealEvent",
      { i: hab["prefix"], s: mstate["ee"]["s"], d: mstate["ee"]["d"] },
    ];
    const sigers = sigs.map((sig) => new Siger({ qb64: sig }));
    const roleims = d(
      messagize(rpy, sigers, seal, undefined, undefined, false)
    );
    const atc = roleims.substring(rpy.size);
    const roleEmbeds = {
      rpy: [rpy, atc],
    };
    const { ourIdentifier, multisigMembers } =
      await this.getMultisigParticipants(multisigSignifyName);
    const recp = multisigMembers
      .filter((signing: any) => signing.aid !== ourIdentifier.id)
      .map((member: any) => member.aid);
    const ourAid: Aid = await this.props.signifyClient
      .identifiers()
      .get(ourIdentifier.signifyName as string);

    await this.sendMultisigExn(
      ourIdentifier.signifyName,
      ourAid,
      MultiSigRoute.RPY,
      roleEmbeds,
      recp,
      { gid: hab["prefix"] }
    );
  }

  async multisigAdmit(
    multisigSignifyName: string,
    notificationSaid: string,
    schemaSaids: string[],
    admitExnToJoin?: any
  ) {
    let exn: Serder;
    let sigsMes: string[];
    let dtime: string;

    await Promise.all(
      schemaSaids.map(
        async (schemaSaid) =>
          await Agent.agent.connections.resolveOobi(
            `${ConfigurationService.env.keri.credentials.testServer.urlInt}/oobi/${schemaSaid}`,
            true
          )
      )
    );

    const exchangeMessage = await this.props.signifyClient
      .exchanges()
      .get(notificationSaid);
    const grantSaid = exchangeMessage.exn.d;
    const { ourIdentifier, multisigMembers } =
      await this.getMultisigParticipants(multisigSignifyName);
    const gHab = await this.props.signifyClient
      .identifiers()
      .get(multisigSignifyName);
    const mHab = await this.props.signifyClient
      .identifiers()
      .get(ourIdentifier.signifyName);

    const recp = multisigMembers
      .filter((signing: any) => signing.aid !== ourIdentifier.id)
      .map((member: any) => member.aid);

    if (admitExnToJoin) {
      const [, ked] = Saider.saidify(admitExnToJoin);
      const admit = new Serder(ked);

      const keeper = await this.props.signifyClient.manager!.get(gHab);
      const sigs = await keeper.sign(b(new Serder(admitExnToJoin).raw));

      const mstateNew = gHab["state"];
      const seal = [
        "SealEvent",
        {
          i: gHab["prefix"],
          s: mstateNew["ee"]["s"],
          d: mstateNew["ee"]["d"],
        },
      ];

      const sigers = sigs.map((sig: any) => new Siger({ qb64: sig }));
      const ims = d(messagize(admit, sigers, seal));
      const atc = ims.substring(admit.size);
      const gembeds = {
        exn: [admit, atc],
      };

      [exn, sigsMes, dtime] = await this.props.signifyClient
        .exchanges()
        .createExchangeMessage(
          mHab,
          "/multisig/exn",
          { gid: gHab["prefix"] },
          gembeds
        );
    } else {
      const time = new Date().toISOString().replace("Z", "000+00:00");
      const [admit, sigs, end] = await this.props.signifyClient
        .ipex()
        .admit(multisigSignifyName, "", grantSaid, time);

      const mstate = gHab["state"];
      const seal = [
        "SealEvent",
        { i: gHab["prefix"], s: mstate["ee"]["s"], d: mstate["ee"]["d"] },
      ];
      const sigers = sigs.map((sig: any) => new Siger({ qb64: sig }));
      const ims = d(messagize(admit, sigers, seal));
      let atc = ims.substring(admit.size);
      atc += end;
      const gembeds = {
        exn: [admit, atc],
      };

      [exn, sigsMes, dtime] = await this.props.signifyClient
        .exchanges()
        .createExchangeMessage(
          mHab,
          "/multisig/exn",
          { gid: gHab["prefix"] },
          gembeds
        );
    }

    const op = await this.props.signifyClient
      .ipex()
      .submitAdmit(multisigSignifyName, exn, sigsMes, dtime, recp);

    return op;
  }
}

export { MultiSigService };
