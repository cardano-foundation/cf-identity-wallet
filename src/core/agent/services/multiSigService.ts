import {
  Algos,
  d,
  EventResult,
  HabState,
  messagize,
  Serder,
  Siger,
} from "signify-ts";
import {
  IdentifierResult,
  NotificationRoute,
  CreateGroupIdentifierResult,
  AgentServicesProps,
} from "../agent.types";
import type {
  ConnectionShortDetails,
  AuthorizationRequestExn,
} from "../agent.types";
import {
  IdentifierMetadataRecordProps,
  IdentifierStorage,
  NotificationStorage,
  OperationPendingStorage,
} from "../records";
import { AgentService } from "./agentService";
import { CreationStatus, MultiSigIcpRequestDetails } from "./identifier.types";
import {
  MultiSigRoute,
  CreateMultisigExnPayload,
  AuthorizationExnPayload,
  InceptMultiSigExnMessage,
} from "./multiSig.types";
import { deleteNotificationRecordById, OnlineOnly } from "./utils";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { OperationAddedEvent, EventTypes } from "../event.types";
import { ConnectionService } from "./connectionService";
import { IdentifierService } from "./identifierService";

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
  protected readonly operationPendingStorage: OperationPendingStorage;
  protected readonly notificationStorage: NotificationStorage;
  protected readonly connections: ConnectionService;
  protected readonly identifiers: IdentifierService;

  constructor(
    agentServiceProps: AgentServicesProps,
    identifierStorage: IdentifierStorage,
    operationPendingStorage: OperationPendingStorage,
    notificationStorage: NotificationStorage,
    connections: ConnectionService,
    identifiers: IdentifierService
  ) {
    super(agentServiceProps);
    this.identifierStorage = identifierStorage;
    this.operationPendingStorage = operationPendingStorage;
    this.notificationStorage = notificationStorage;
    this.connections = connections;
    this.identifiers = identifiers;
  }

  @OnlineOnly
  async createMultisig(
    ourIdentifier: string,
    otherIdentifierContacts: ConnectionShortDetails[],
    threshold: number
  ): Promise<CreateGroupIdentifierResult> {
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
    const ourAid: HabState = await this.props.signifyClient
      .identifiers()
      .get(ourMetadata.id as string);
    const otherAids = await Promise.all(
      otherIdentifierContacts.map(async (contact) => {
        const { op } = await this.connections.resolveOobi(
          contact.oobi as string
        );
        return { state: op.response };
      })
    );
    const name = `${ourMetadata.theme}:${ourMetadata.displayName}`;
    const result = await this.createAidMultisig(
      ourAid,
      otherAids,
      name,
      threshold
    );
    const op = result.op;
    const multisigId = op.name.split(".")[1];
    const creationStatus = op.done
      ? op.error
        ? CreationStatus.FAILED
        : CreationStatus.COMPLETE
      : CreationStatus.PENDING;

    const multisigDetail = (await this.props.signifyClient
      .identifiers()
      .get(multisigId as string)) as HabState;

    await this.identifierStorage.createIdentifierMetadataRecord({
      id: multisigId,
      displayName: ourMetadata.displayName,
      theme: ourMetadata.theme,
      creationStatus,
      multisigManageAid: ourIdentifier,
      createdAt: new Date(multisigDetail.icp_dt),
    });
    ourMetadata.groupMetadata.groupCreated = true;
    await this.identifierStorage.updateIdentifierMetadata(
      ourMetadata.id,
      ourMetadata
    );
    if (creationStatus === CreationStatus.PENDING) {
      await this.operationPendingStorage.save({
        id: op.name,
        recordType: OperationPendingRecordType.Group,
      });
    } else {
      // Trigger the end role authorization if the operation is done
      await this.endRoleAuthorization(multisigId);
    }
    return { identifier: multisigId, creationStatus };
  }

  private async createAidMultisig(
    aid: HabState,
    otherAids: Pick<HabState, "state">[],
    prefix: string,
    threshold: number
  ): Promise<{
    op: any;
    icpResult: EventResult;
    prefix: string;
  }> {
    const states = [aid["state"], ...otherAids.map((aid) => aid["state"])];
    const icp = await this.props.signifyClient.identifiers().create(prefix, {
      algo: Algos.group,
      mhab: aid,
      isith: threshold,
      nsith: threshold,
      toad: aid.state.b.length,
      wits: aid.state.b,
      states: states,
      rstates: states,
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
      aid["prefix"],
      aid,
      MultiSigRoute.ICP,
      embeds,
      recp,
      {
        gid: serder.pre,
        smids: smids,
        rmids: smids,
        rstates: states,
        name: prefix,
      }
    );
    return {
      op: op,
      icpResult: icp,
      prefix,
    };
  }

  private async hasJoinedMultisig(msgSaid: string): Promise<boolean> {
    const notifications: InceptMultiSigExnMessage[] =
      await this.props.signifyClient
        .groups()
        .getRequest(msgSaid)
        .catch((error) => {
          const status = error.message.split(" - ")[1];
          if (/404/gi.test(status)) {
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
    const icpMsg: InceptMultiSigExnMessage[] = await this.props.signifyClient
      .groups()
      .getRequest(notificationSaid)
      .catch((error) => {
        const status = error.message.split(" - ")[1];
        if (/404/gi.test(status)) {
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
    const senderContact = await this.connections.getConnectionShortDetailById(
      icpMsg[0].exn.i
    );

    const smids = icpMsg[0].exn.a.smids;
    // @TODO - foconnor: These searches should be optimised, revisit.
    const ourIdentifiers = await this.identifiers.getIdentifiers();

    const ourIdentifier = ourIdentifiers.find((identifier) =>
      smids.includes(identifier.id)
    );
    if (!ourIdentifier || !ourIdentifier.groupMetadata?.groupId) {
      throw new Error(MultiSigService.MEMBER_AID_NOT_FOUND);
    }

    const otherConnections = (
      await this.connections.getMultisigLinkedContacts(
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
      threshold: parseInt(icpMsg[0].exn.e.icp.kt as string),
    };
  }

  @OnlineOnly
  async joinMultisig(
    notificationId: string,
    notificationRoute: NotificationRoute,
    notificationSaid: string,
    meta: Pick<IdentifierMetadataRecordProps, "displayName" | "theme">
  ): Promise<CreateGroupIdentifierResult | undefined> {
    // @TODO - foconnor: getMultisigDetails already has much of this done so this method signature could be adjusted.
    const hasJoined = await this.hasJoinedMultisig(notificationSaid);
    if (hasJoined) {
      await deleteNotificationRecordById(
        this.props.signifyClient,
        this.notificationStorage,
        notificationId,
        notificationRoute
      );
      return;
    }
    const icpMsg: InceptMultiSigExnMessage[] = await this.props.signifyClient
      .groups()
      .getRequest(notificationSaid)
      .catch((error) => {
        const status = error.message.split(" - ")[1];
        if (/404/gi.test(status)) {
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
    const identifiers = await this.identifiers.getIdentifiers();
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
      .get(identifier?.id);

    const name = `${meta.theme}:${meta.displayName}`;
    const res = await this.joinMultisigKeri(exn, aid, name);
    const op = res.op;
    const multisigId = op.name.split(".")[1];
    const creationStatus = op.done
      ? op.error
        ? CreationStatus.FAILED
        : CreationStatus.COMPLETE
      : CreationStatus.PENDING;

    const multisigDetail = (await this.props.signifyClient
      .identifiers()
      .get(multisigId)) as HabState;

    await this.identifierStorage.createIdentifierMetadataRecord({
      id: multisigId,
      displayName: meta.displayName,
      theme: meta.theme,
      creationStatus,
      multisigManageAid: identifier.id,
      createdAt: new Date(multisigDetail.icp_dt),
    });
    identifier.groupMetadata.groupCreated = true;
    await this.identifierStorage.updateIdentifierMetadata(
      identifier.id,
      identifier
    );

    if (creationStatus === CreationStatus.PENDING) {
      await this.operationPendingStorage.save({
        id: op.name,
        recordType: OperationPendingRecordType.Group,
      });
    } else {
      // Trigger the end role authorization if the operation is done
      await this.endRoleAuthorization(multisigId);
    }
    await deleteNotificationRecordById(
      this.props.signifyClient,
      this.notificationStorage,
      notificationId,
      notificationRoute
    );
    return {
      identifier: multisigId,
      multisigManageAid: identifier.id,
      creationStatus,
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
    exn: InceptMultiSigExnMessage["exn"],
    aid: HabState,
    prefix: string
  ): Promise<{
    op: any;
    icpResult: EventResult;
    prefix: string;
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
      .create(prefix, {
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
      aid["prefix"],
      aid,
      MultiSigRoute.ICP,
      embeds,
      recp,
      {
        gid: serder.pre,
        smids: smids,
        rmids: smids,
        rstates,
        name: prefix,
      }
    );
    return {
      op: op,
      icpResult: icpResult,
      prefix,
    };
  }

  private async sendMultisigExn(
    prefix: string,
    aid: HabState,
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
      .send(prefix, "multisig", aid, route, payload, embeds, recp);
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

  async getMultisigParticipants(multisigId: string) {
    const members = await this.props.signifyClient
      .identifiers()
      .members(multisigId);
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

  async endRoleAuthorization(multisigId: string): Promise<void> {
    const { ourIdentifier, multisigMembers } =
      await this.getMultisigParticipants(multisigId);
    const hab = await this.props.signifyClient.identifiers().get(multisigId);
    const aid = hab["prefix"];
    const recp = multisigMembers
      .filter((signing: any) => signing.aid !== ourIdentifier.id)
      .map((member: any) => member.aid);
    const ourAid = await this.props.signifyClient
      .identifiers()
      .get(ourIdentifier.id as string);
    for (const member of multisigMembers) {
      const eid = Object.keys(member.ends.agent)[0]; //agent of member
      const stamp = new Date().toISOString().replace("Z", "000+00:00");

      const endRoleRes = await this.props.signifyClient
        .identifiers()
        .addEndRole(multisigId, "agent", eid, stamp);
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
        ourIdentifier.id,
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

    const multisigId = multisigMetadataRecord.id;
    // stamp, eid and role are provided in the exn message
    const rpystamp = requestExn.e.rpy.dt;
    const rpyrole = requestExn.e.rpy.a.role;
    const rpyeid = requestExn.e.rpy.a.eid;
    const endRoleRes = await this.props.signifyClient
      .identifiers()
      .addEndRole(multisigId, rpyrole, rpyeid, rpystamp);

    await endRoleRes.op();
    const rpy = endRoleRes.serder;
    const sigs = endRoleRes.sigs;

    const hab = await this.props.signifyClient.identifiers().get(multisigId);
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
      await this.getMultisigParticipants(multisigId);
    const recp = multisigMembers
      .filter((signing: any) => signing.aid !== ourIdentifier.id)
      .map((member: any) => member.aid);
    const ourAid = await this.props.signifyClient
      .identifiers()
      .get(ourIdentifier.id as string);

    await this.sendMultisigExn(
      ourIdentifier.id,
      ourAid,
      MultiSigRoute.RPY,
      roleEmbeds,
      recp,
      { gid: hab["prefix"] }
    );
  }
}

export { MultiSigService };
