import { b, d, messagize, Operation, Saider, Serder, Siger } from "signify-ts";
import { ConfigurationService } from "../../configuration";
import { Agent } from "../agent";
import {
  ExchangeRoute,
  IpexMessage,
  NotificationRoute,
  type AgentServicesProps,
  type KeriaNotification,
} from "../agent.types";
import {
  CredentialStorage,
  IdentifierStorage,
  NotificationStorage,
  OperationPendingStorage,
  IpexMessageStorage,
} from "../records";
import { CredentialMetadataRecordProps } from "../records/credentialMetadataRecord.types";
import { AgentService } from "./agentService";
import {
  OnlineOnly,
  getCredentialShortDetails,
  deleteNotificationRecordById,
} from "./utils";
import { CredentialStatus, ACDCDetails } from "./credentialService.types";
import { CredentialsMatchingApply } from "./ipexCommunicationService.types";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { ConnectionHistoryType } from "./connection.types";
import { MultiSigService } from "./multiSigService";
import { GrantToJoinMultisigExnPayload, MultiSigRoute } from "./multiSig.types";
import {
  AcdcStateChangedEvent,
  OperationAddedEvent,
  EventTypes,
} from "../event.types";
import { ConnectionService } from "./connectionService";

class IpexCommunicationService extends AgentService {
  static readonly ISSUEE_NOT_FOUND_LOCALLY =
    "Cannot accept incoming ACDC, issuee AID not found in local wallet DB";
  static readonly ACDC_NOT_APPEARING = "ACDC is not appearing..."; // @TODO - foconnor: This is async we should wait for a notification
  static readonly NOTIFICATION_NOT_FOUND = "Notification record not found";
  static readonly CREDENTIAL_NOT_FOUND_WITH_SCHEMA =
    "Credential not found with this schema";

  static readonly CREDENTIAL_NOT_FOUND = "Credential not found";
  static readonly SCHEMA_NOT_FOUND = "Schema not found";

  static readonly CREDENTIAL_SERVER =
    "https://dev.credentials.cf-keripy.metadata.dev.cf-deployments.org/oobi/";
  static readonly SCHEMA_SAID_RARE_EVO_DEMO =
    "EJxnJdxkHbRw2wVFNe4IUOPLt8fEtg9Sr3WyTjlgKoIb";

  protected readonly identifierStorage: IdentifierStorage;
  protected readonly credentialStorage: CredentialStorage;
  protected readonly notificationStorage: NotificationStorage;
  protected readonly ipexMessageStorage: IpexMessageStorage;
  protected readonly operationPendingStorage: OperationPendingStorage;
  protected readonly multisigService: MultiSigService;
  protected readonly connections: ConnectionService;

  constructor(
    agentServiceProps: AgentServicesProps,
    identifierStorage: IdentifierStorage,
    credentialStorage: CredentialStorage,
    notificationStorage: NotificationStorage,
    ipexMessageStorage: IpexMessageStorage,
    operationPendingStorage: OperationPendingStorage,
    multisigService: MultiSigService,
    connections: ConnectionService
  ) {
    super(agentServiceProps);
    this.identifierStorage = identifierStorage;
    this.credentialStorage = credentialStorage;
    this.notificationStorage = notificationStorage;
    this.ipexMessageStorage = ipexMessageStorage;
    this.operationPendingStorage = operationPendingStorage;
    this.multisigService = multisigService;
    this.connections = connections;
  }

  @OnlineOnly
  async acceptAcdc(id: string): Promise<void> {
    const grantNoteRecord = await this.notificationStorage.findById(id);

    if (!grantNoteRecord) {
      throw new Error(
        `${IpexCommunicationService.NOTIFICATION_NOT_FOUND} ${id}`
      );
    }

    if (Object.keys(grantNoteRecord.linkedGroupRequests).length) {
      const linkedGroupRequestDetails = Object.values(
        grantNoteRecord.linkedGroupRequests
      )[0]; // Can only be related to 1 credentialId
      if (!linkedGroupRequestDetails.accepted) {
        // @TODO - foconnor: Improve reliability here, if multiple to join and fails halfway through, accepted will be true
        for (const [, msSaids] of Object.entries(
          linkedGroupRequestDetails.saids
        )) {
          if (!msSaids.length) continue; // Should never happen
          await this.acceptAcdcFromMultisigExn(msSaids[0][1]); // Join the first received for this particular /ipex/admit, skip the rest
        }
      }
      return;
    }

    const grantExn = await this.props.signifyClient
      .exchanges()
      .get(grantNoteRecord.a.d as string);

    const connectionId = grantExn.exn.i;

    const holder = await this.identifierStorage.getIdentifierMetadata(
      grantExn.exn.a.i
    );
    if (!holder) {
      throw new Error(IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY);
    }

    const schemaSaid = grantExn.exn.e.acdc.s;
    await this.connections.resolveOobi(
      `${ConfigurationService.env.keri.credentials.testServer.urlInt}/oobi/${schemaSaid}`
    );

    const allSchemaSaids = Object.keys(grantExn.exn.e.acdc?.e || {}).map(
      // Chained schemas, will be resolved in admit/multisigAdmit
      (key) => grantExn.exn.e.acdc.e?.[key]?.s
    );
    allSchemaSaids.push(schemaSaid);

    const schema = await this.props.signifyClient.schemas().get(schemaSaid);
    const credential = await this.saveAcdcMetadataRecord(
      grantExn.exn.e.acdc.d,
      grantExn.exn.e.acdc.a.dt,
      schema.title,
      connectionId,
      schemaSaid
    );

    this.props.eventEmitter.emit<AcdcStateChangedEvent>({
      type: EventTypes.AcdcStateChanged,
      payload: {
        credential,
        status: CredentialStatus.PENDING,
      },
    });

    let op: Operation;
    if (holder.multisigManageAid) {
      const {
        op: opMultisigAdmit,
        exnSaid,
        ipexAdmitSaid,
        member,
      } = await this.multisigService.multisigAdmit(
        holder.id,
        grantNoteRecord.a.d as string,
        allSchemaSaids
      );
      op = opMultisigAdmit;
      grantNoteRecord.linkedGroupRequests = {
        [credential.id]: {
          accepted: true,
          saids: {
            [ipexAdmitSaid]: [[member, exnSaid]],
          },
        },
      };
      await this.notificationStorage.update(grantNoteRecord);
    } else {
      op = await this.admitIpex(
        grantNoteRecord.a.d as string,
        holder.id,
        grantExn.exn.i,
        allSchemaSaids
      );
    }
    await this.createLinkedIpexMessageRecord(
      grantExn,
      ConnectionHistoryType.CREDENTIAL_ISSUANCE
    );

    const pendingOperation = await this.operationPendingStorage.save({
      id: op.name,
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });

    this.props.eventEmitter.emit<OperationAddedEvent>({
      type: EventTypes.OperationAdded,
      payload: { operation: pendingOperation },
    });

    if (!holder.multisigManageAid) {
      await deleteNotificationRecordById(
        this.props.signifyClient,
        this.notificationStorage,
        id,
        grantNoteRecord.a.r as NotificationRoute
      );
    }
  }

  @OnlineOnly
  async offerAcdcFromApply(id: string, acdc: any) {
    const applyNoteRecord = await this.notificationStorage.findById(id);

    if (!applyNoteRecord) {
      throw new Error(
        `${IpexCommunicationService.NOTIFICATION_NOT_FOUND} ${id}`
      );
    }

    if (Object.keys(applyNoteRecord.linkedGroupRequests).length) {
      const linkedGroupRequestDetails =
        applyNoteRecord.linkedGroupRequests[acdc.d];
      if (linkedGroupRequestDetails) {
        if (!linkedGroupRequestDetails.accepted) {
          // @TODO - foconnor: Improve reliability here, if multiple to join and fails halfway through, accepted will be true
          for (const [, msSaids] of Object.entries(
            linkedGroupRequestDetails.saids
          )) {
            if (!msSaids.length) continue; // Should never happen
            await this.joinMultisigOffer(msSaids[0][1]); // Join the first received for this particular /ipex/apply, skip the rest
          }
        }
        return; // Only return here if there are linked requests for this credential ID!
      }
    }

    const msgSaid = applyNoteRecord.a.d as string;
    const applyExn = await this.props.signifyClient.exchanges().get(msgSaid);
    const discloser = await this.identifierStorage.getIdentifierMetadata(
      applyExn.exn.a.i
    );

    let op: Operation;
    if (discloser.multisigManageAid) {
      const acdcSaid = acdc.d as string;
      const {
        op: opMultisigOffer,
        exnSaid,
        ipexOfferSaid,
        member,
      } = await this.multisigOfferAcdcFromApply(
        discloser.id,
        msgSaid,
        acdc,
        applyExn.exn.i
      );
      op = opMultisigOffer;
      applyNoteRecord.linkedGroupRequests = {
        [acdcSaid]: {
          accepted: true,
          saids: {
            [ipexOfferSaid]: [[member, exnSaid]],
          },
        },
      };
      await this.notificationStorage.update(applyNoteRecord);
    } else {
      const [offer, sigs, end] = await this.props.signifyClient.ipex().offer({
        senderName: discloser.id,
        recipient: applyExn.exn.i,
        acdc: new Serder(acdc),
        applySaid: applyExn.exn.d,
      });
      op = await this.props.signifyClient
        .ipex()
        .submitOffer(discloser.id, offer, sigs, end, [applyExn.exn.i]);
    }

    const pendingOperation = await this.operationPendingStorage.save({
      id: op.name,
      recordType: OperationPendingRecordType.ExchangeOfferCredential,
    });

    this.props.eventEmitter.emit<OperationAddedEvent>({
      type: EventTypes.OperationAdded,
      payload: { operation: pendingOperation },
    });

    if (!discloser.multisigManageAid) {
      await deleteNotificationRecordById(
        this.props.signifyClient,
        this.notificationStorage,
        id,
        applyNoteRecord.a.r as NotificationRoute
      );
    }
  }

  @OnlineOnly
  async grantAcdcFromAgree(id: string) {
    const agreeNoteRecord = await this.notificationStorage.findById(id);
    if (!agreeNoteRecord) {
      throw new Error(
        `${IpexCommunicationService.NOTIFICATION_NOT_FOUND} ${id}`
      );
    }

    const msgSaid = agreeNoteRecord.a.d as string;
    const agreeExn = await this.props.signifyClient.exchanges().get(msgSaid);
    const offerExn = await this.props.signifyClient
      .exchanges()
      .get(agreeExn.exn.p);
    const acdcSaid = offerExn.exn.e.acdc.d;

    if (Object.keys(agreeNoteRecord.linkedGroupRequests).length) {
      const linkedGroupRequestDetails =
        agreeNoteRecord.linkedGroupRequests[acdcSaid];

      if (linkedGroupRequestDetails) {
        if (!linkedGroupRequestDetails.accepted) {
          // @TODO - foconnor: Improve reliability here, if multiple to join and fails halfway through, accepted will be true
          for (const [, msSaids] of Object.entries(
            linkedGroupRequestDetails.saids
          )) {
            if (!msSaids.length) continue; // Should never happen
            await this.joinMultisigGrant(msSaids[0][1]); // Join the first received for this particular /ipex/agree, skip the rest
          }
        }
        return; // Only return here if there are linked requests for this credential ID!
      }
    }

    //TODO: this might throw 500 internal server error, might not run to the next line at the moment
    const pickedCred = await this.props.signifyClient
      .credentials()
      .get(acdcSaid);
    if (!pickedCred) {
      throw new Error(IpexCommunicationService.CREDENTIAL_NOT_FOUND);
    }

    const discloser = await this.identifierStorage.getIdentifierMetadata(
      agreeExn.exn.a.i
    );

    let op: Operation;
    if (discloser.multisigManageAid) {
      const {
        op: opMultisigGrant,
        exnSaid,
        ipexGrantSaid,
        member,
      } = await this.multisigGrantAcdcFromAgree(
        discloser.id,
        agreeExn.exn.i,
        agreeExn.exn.d,
        pickedCred
      );
      op = opMultisigGrant;

      const credentialSaid = pickedCred.sad.d as string;
      agreeNoteRecord.linkedGroupRequests = {
        [credentialSaid]: {
          accepted: true,
          saids: {
            [ipexGrantSaid]: [[member, exnSaid]],
          },
        },
      };
      await this.notificationStorage.update(agreeNoteRecord);
    } else {
      const [grant, sigs, end] = await this.props.signifyClient.ipex().grant({
        senderName: discloser.id,
        recipient: agreeExn.exn.i,
        acdc: new Serder(pickedCred.sad),
        anc: new Serder(pickedCred.anc),
        iss: new Serder(pickedCred.iss),
        acdcAttachment: pickedCred.atc,
        ancAttachment: pickedCred.ancatc,
        issAttachment: pickedCred.issAtc,
        agreeSaid: agreeExn.exn.d,
      });
      op = await this.props.signifyClient
        .ipex()
        .submitGrant(discloser.id, grant, sigs, end, [agreeExn.exn.i]);
    }

    const pendingOperation = await this.operationPendingStorage.save({
      id: op.name,
      recordType: OperationPendingRecordType.ExchangePresentCredential,
    });

    this.props.eventEmitter.emit<OperationAddedEvent>({
      type: EventTypes.OperationAdded,
      payload: { operation: pendingOperation },
    });

    if (!discloser.multisigManageAid) {
      await deleteNotificationRecordById(
        this.props.signifyClient,
        this.notificationStorage,
        id,
        agreeNoteRecord.a.r as NotificationRoute
      );
    }
  }

  @OnlineOnly
  async getIpexApplyDetails(
    notification: KeriaNotification
  ): Promise<CredentialsMatchingApply> {
    const msgSaid = notification.a.d as string;
    const msg = await this.props.signifyClient.exchanges().get(msgSaid);
    const schemaSaid = msg.exn.a.s;
    const attributes = msg.exn.a.a;
    const recipient = msg.exn.rp;
    const schemaKeri = await this.props.signifyClient
      .schemas()
      .get(schemaSaid)
      .catch((error) => {
        const status = error.message.split(" - ")[1];
        if (/404/gi.test(status)) {
          return undefined;
        } else {
          throw error;
        }
      });
    if (!schemaKeri) {
      throw new Error(IpexCommunicationService.SCHEMA_NOT_FOUND);
    }

    const filter = {
      "-s": { $eq: schemaSaid },
      "-a-i": recipient,
      ...(Object.keys(attributes).length > 0
        ? {
          ...Object.fromEntries(
            Object.entries(attributes).map(([key, value]) => [
              "-a-" + key,
              value,
            ])
          ),
        }
        : {}),
    };

    const creds = await this.props.signifyClient.credentials().list({
      filter,
    });

    const credentialMetadatas =
      await this.credentialStorage.getCredentialMetadatasById(
        creds.map((cred: any) => cred.sad.d),
        {
          $and: [{ isDeleted: false }, { isArchived: false }],
        }
      );
    return {
      schema: {
        name: schemaKeri.title,
        description: schemaKeri.description,
      },
      credentials: credentialMetadatas.map((cr) => {
        const credKeri = creds.find((cred: any) => cred.sad.d === cr.id);
        return {
          connectionId: cr.connectionId,
          acdc: credKeri.sad,
        };
      }),
      attributes: attributes,
    };
  }

  private async saveAcdcMetadataRecord(
    credentialId: string,
    dateTime: string,
    schemaTitle: string,
    connectionId: string,
    schema: string
  ): Promise<CredentialMetadataRecordProps> {
    const credentialDetails: CredentialMetadataRecordProps = {
      id: credentialId,
      isArchived: false,
      credentialType: schemaTitle,
      issuanceDate: new Date(dateTime).toISOString(),
      status: CredentialStatus.PENDING,
      connectionId,
      schema,
    };
    await this.credentialStorage.saveCredentialMetadataRecord(
      credentialDetails
    );
    return credentialDetails;
  }

  private async admitIpex(
    notificationD: string,
    holderAid: string,
    issuerAid: string,
    schemaSaids: string[]
  ): Promise<Operation> {
    // @TODO - foconnor: For now this will only work with our test server, we need to find a better way to handle this in production.
    for (const schemaSaid of schemaSaids) {
      if (schemaSaid) {
        await this.connections.resolveOobi(
          `${ConfigurationService.env.keri.credentials.testServer.urlInt}/oobi/${schemaSaid}`
        );
      }
    }

    const dt = new Date().toISOString().replace("Z", "000+00:00");
    const [admit, sigs, aend] = await this.props.signifyClient.ipex().admit({
      senderName: holderAid,
      message: "",
      grantSaid: notificationD,
      recipient: issuerAid,
      datetime: dt,
    });
    const op = await this.props.signifyClient
      .ipex()
      .submitAdmit(holderAid, admit, sigs, aend, [issuerAid]);
    return op;
  }

  async createLinkedIpexMessageRecord(
    message: IpexMessage,
    historyType: ConnectionHistoryType
  ): Promise<void> {
    let schemaSaid;
    if (message.exn.r === ExchangeRoute.IpexGrant) {
      schemaSaid = message.exn.e.acdc.s;
    } else if (message.exn.r === ExchangeRoute.IpexApply) {
      schemaSaid = message.exn.a.s;
    } else if (message.exn.r === ExchangeRoute.IpexAgree) {
      const previousExchange = await this.props.signifyClient
        .exchanges()
        .get(message.exn.p);
      schemaSaid = previousExchange.exn.e.acdc.s;
    }

    await this.connections.resolveOobi(
      `${ConfigurationService.env.keri.credentials.testServer.urlInt}/oobi/${schemaSaid}`
    );
    const schema = await this.props.signifyClient.schemas().get(schemaSaid);
    await this.ipexMessageStorage.createIpexMessageRecord({
      id: message.exn.d,
      credentialType: schema?.title,
      content: message,
      connectionId: message.exn.i,
      historyType,
    });
  }

  @OnlineOnly
  async acceptAcdcFromMultisigExn(multiSigExnSaid: string): Promise<void> {
    const exn = await this.props.signifyClient.exchanges().get(multiSigExnSaid);

    const admitExn = exn.exn.e.exn;
    const grantExn = await this.props.signifyClient.exchanges().get(admitExn.p);

    const holder = await this.identifierStorage.getIdentifierMetadata(
      admitExn.i
    );

    if (!holder) {
      throw new Error(IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY);
    }

    const credentialId = grantExn.exn.e.acdc.d;
    const connectionId = grantExn.exn.i;

    const schemaSaid = grantExn.exn.e.acdc.s;
    const allSchemaSaids = Object.keys(grantExn.exn.e.acdc?.e || {}).map(
      (key) => grantExn.exn.e.acdc.e?.[key]?.s
    );
    allSchemaSaids.push(schemaSaid);

    const { op } = await this.multisigService.multisigAdmit(
      holder.id,
      grantExn.exn.d as string,
      allSchemaSaids,
      admitExn
    );

    const schema = await this.props.signifyClient.schemas().get(schemaSaid);
    const credentialPending =
      await this.credentialStorage.getCredentialMetadata(credentialId);

    if (!credentialPending) {
      const credential = await this.saveAcdcMetadataRecord(
        credentialId,
        grantExn.exn.e.acdc.a.dt,
        schema.title,
        connectionId,
        schemaSaid
      );

      this.props.eventEmitter.emit<AcdcStateChangedEvent>({
        type: EventTypes.AcdcStateChanged,
        payload: {
          credential,
          status: CredentialStatus.PENDING,
        },
      });
    }

    const pendingOperation = await this.operationPendingStorage.save({
      id: op.name,
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });

    this.props.eventEmitter.emit<OperationAddedEvent>({
      type: EventTypes.OperationAdded,
      payload: { operation: pendingOperation },
    });

    const notifications = await this.notificationStorage.findAllByQuery({
      exnSaid: grantExn.d,
    });

    // @TODO - foconnor: Similarly called in keriaNotificationService too - need to refactor in case of reliability issues
    if (notifications.length) {
      const notificationRecord = notifications[0];
      notificationRecord.linkedGroupRequests[credentialId] = {
        ...notificationRecord.linkedGroupRequests[credentialId],
        accepted: true,
      };

      await this.notificationStorage.update(notificationRecord);
    }
  }

  async joinMultisigOffer(multiSigExnSaid: string): Promise<void> {
    const exn = await this.props.signifyClient.exchanges().get(multiSigExnSaid);
    const offerExn = exn.exn.e.exn;
    const holder = await this.identifierStorage.getIdentifierMetadata(
      offerExn.i
    );

    if (!holder) {
      throw new Error(IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY);
    }

    const issuerPrefix = offerExn.a.i;
    const credential = offerExn.e.acdc;
    const applySaid = offerExn.p;

    const { op } = await this.multisigOfferAcdcFromApply(
      holder.id,
      applySaid as string,
      credential,
      issuerPrefix,
      offerExn
    );

    const pendingOperation = await this.operationPendingStorage.save({
      id: op.name,
      recordType: OperationPendingRecordType.ExchangeOfferCredential,
    });

    this.props.eventEmitter.emit<OperationAddedEvent>({
      type: EventTypes.OperationAdded,
      payload: { operation: pendingOperation },
    });

    const notifications = await this.notificationStorage.findAllByQuery({
      exnSaid: offerExn.p,
    });

    // @TODO - foconnor: Similarly called in keriaNotificationService too - need to refactor in case of reliability issues
    if (notifications.length) {
      const acdcSaid = credential.d as string;
      const notificationRecord = notifications[0];
      notificationRecord.linkedGroupRequests[acdcSaid] = {
        ...notificationRecord.linkedGroupRequests[acdcSaid],
        accepted: true,
      };

      await this.notificationStorage.update(notificationRecord);
    }
  }

  async joinMultisigGrant(multiSigExnSaid: string): Promise<void> {
    const exn = await this.props.signifyClient.exchanges().get(multiSigExnSaid);

    const grantExn = exn.exn.e.exn;
    const credential = grantExn.e.acdc;
    const holder = await this.identifierStorage.getIdentifierMetadata(
      exn.exn.e.exn.i
    );

    if (!holder) {
      throw new Error(IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY);
    }

    const { op } = await this.multisigGrantAcdcFromAgree(
      holder.id,
      credential.i,
      grantExn.p,
      credential,
      {
        grantExn,
        atc: exn.pathed.exn,
      }
    );

    const pendingOperation = await this.operationPendingStorage.save({
      id: op.name,
      recordType: OperationPendingRecordType.ExchangePresentCredential,
    });

    this.props.eventEmitter.emit<OperationAddedEvent>({
      type: EventTypes.OperationAdded,
      payload: { operation: pendingOperation },
    });

    const notifications = await this.notificationStorage.findAllByQuery({
      exnSaid: exn?.exn.e.exn.p,
    });

    if (notifications.length) {
      const acdcSaid = credential.d as string;
      const notificationRecord = notifications[0];
      notificationRecord.linkedGroupRequests[acdcSaid] = {
        ...notificationRecord.linkedGroupRequests[acdcSaid],
        accepted: true,
      };

      await this.notificationStorage.update(notificationRecord);
    }
  }

  async multisigOfferAcdcFromApply(
    multisigId: string,
    notificationSaid: string,
    acdcDetail: any,
    discloseePrefix: string,
    offerExnToJoin?: any
  ) {
    let exn: Serder;
    let sigsMes: string[];
    let dtime: string;
    let ipexOfferSaid: string;

    const { ourIdentifier, multisigMembers } =
      await this.multisigService.getMultisigParticipants(multisigId);

    const gHab = await this.props.signifyClient.identifiers().get(multisigId);
    const mHab = await this.props.signifyClient
      .identifiers()
      .get(ourIdentifier.id);

    const recp = multisigMembers
      .filter((signing: any) => signing.aid !== ourIdentifier.id)
      .map((member: any) => member.aid);

    const [_, acdc] = Saider.saidify(acdcDetail);

    if (offerExnToJoin) {
      const [, ked] = Saider.saidify(offerExnToJoin);
      const offer = new Serder(ked);
      const keeper = this.props.signifyClient.manager!.get(gHab);
      const sigs = await keeper.sign(b(new Serder(offerExnToJoin).raw));

      const mstateNew = gHab["state"];
      const seal = [
        "SealEvent",
        {
          i: gHab["prefix"],
          s: mstateNew["ee"]["s"],
          d: mstateNew["ee"]["d"],
        },
      ];
      const signer = sigs.map((sig: any) => new Siger({ qb64: sig }));
      const ims = d(messagize(offer, signer, seal));
      const atc = ims.substring(offer.size);

      const gembeds = {
        exn: [offer, atc],
      };

      [exn, sigsMes, dtime] = await this.props.signifyClient
        .exchanges()
        .createExchangeMessage(
          mHab,
          MultiSigRoute.EXN,
          { gid: gHab["prefix"] },
          gembeds,
          discloseePrefix
        );
      ipexOfferSaid = offer.ked.d;
    } else {
      const time = new Date().toISOString().replace("Z", "000+00:00");
      const applySaid = notificationSaid;

      const [offer, offerSigs, offerEnd] = await this.props.signifyClient
        .ipex()
        .offer({
          senderName: multisigId,
          recipient: discloseePrefix,
          message: "",
          acdc: new Serder(acdc),
          datetime: time,
          applySaid,
        });

      const mstate = gHab["state"];
      const seal = [
        "SealEvent",
        { i: gHab["prefix"], s: mstate["ee"]["s"], d: mstate["ee"]["d"] },
      ];
      const sigers = offerSigs.map((sig: any) => new Siger({ qb64: sig }));
      const ims = d(messagize(offer, sigers, seal));
      let atc = ims.substring(offer.size);
      atc += offerEnd;

      const gembeds = {
        exn: [offer, atc],
      };

      [exn, sigsMes, dtime] = await this.props.signifyClient
        .exchanges()
        .createExchangeMessage(
          mHab,
          MultiSigRoute.EXN,
          { gid: gHab["prefix"] },
          gembeds,
          recp[0]
        );
      ipexOfferSaid = offer.ked.d;
    }

    const op = await this.props.signifyClient
      .ipex()
      .submitOffer(multisigId, exn, sigsMes, dtime, recp);

    return { op, exnSaid: exn.ked.d, ipexOfferSaid, member: ourIdentifier.id };
  }

  async multisigGrantAcdcFromAgree(
    multisigId: string,
    discloseePrefix: string,
    agreeSaid: string,
    acdcDetail: any,
    grantToJoin?: GrantToJoinMultisigExnPayload
  ) {
    let exn: Serder;
    let sigsMes: string[];
    let dtime: string;
    let ipexGrantSaid: string;

    const { ourIdentifier, multisigMembers } =
      await this.multisigService.getMultisigParticipants(multisigId);
    const gHab = await this.props.signifyClient.identifiers().get(multisigId);
    const mHab = await this.props.signifyClient
      .identifiers()
      .get(ourIdentifier.id);

    const recp = multisigMembers
      .filter((signing: any) => signing.aid !== ourIdentifier.id)
      .map((member: any) => member.aid);

    if (grantToJoin) {
      const { grantExn, atc } = grantToJoin;
      const [, ked] = Saider.saidify(grantExn);
      const grant = new Serder(ked);
      const keeper = this.props.signifyClient.manager!.get(gHab);
      const sigs = await keeper.sign(b(new Serder(grantExn).raw));
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
      const ims = d(messagize(grant, sigers, seal));
      let newAtc = ims.substring(grant.size);

      const previousEnd = atc ? atc.slice(newAtc.length) : "";
      newAtc += previousEnd;

      const gembeds = {
        exn: [grant, newAtc],
      };

      [exn, sigsMes, dtime] = await this.props.signifyClient
        .exchanges()
        .createExchangeMessage(
          mHab,
          MultiSigRoute.EXN,
          { gid: gHab["prefix"] },
          gembeds,
          recp[0]
        );

      ipexGrantSaid = grant.ked.d;
    } else {
      const time = new Date().toISOString().replace("Z", "000+00:00");
      const [grant, sigs, end] = await this.props.signifyClient.ipex().grant({
        senderName: multisigId,
        recipient: discloseePrefix,
        message: "",
        acdc: new Serder(acdcDetail.sad),
        iss: new Serder(acdcDetail.iss),
        anc: new Serder(acdcDetail.anc),
        acdcAttachment: acdcDetail?.atc,
        ancAttachment: acdcDetail?.ancatc,
        issAttachment: acdcDetail?.issAtc,
        datetime: time,
        agreeSaid,
      });

      const mstate = gHab["state"];
      const seal = [
        "SealEvent",
        { i: gHab["prefix"], s: mstate["ee"]["s"], d: mstate["ee"]["d"] },
      ];
      const sigers = sigs.map((sig: any) => new Siger({ qb64: sig }));
      const ims = d(messagize(grant, sigers, seal));
      let atc = ims.substring(grant.size);
      atc += end;
      const gembeds = {
        exn: [grant, atc],
      };

      [exn, sigsMes, dtime] = await this.props.signifyClient
        .exchanges()
        .createExchangeMessage(
          mHab,
          MultiSigRoute.EXN,
          { gid: gHab["prefix"] },
          gembeds,
          recp[0]
        );

      ipexGrantSaid = grant.ked.d;
    }

    const op = await this.props.signifyClient
      .ipex()
      .submitGrant(multisigId, exn, sigsMes, dtime, recp);

    return { op, exnSaid: exn.ked.d, ipexGrantSaid, member: ourIdentifier.id };
  }

  async getAcdcFromIpexGrant(said: string): Promise<ACDCDetails> {
    const exchange = await this.props.signifyClient.exchanges().get(said);
    const schemaSaid = exchange.exn.e.acdc.s;
    const schema = await this.props.signifyClient
      .schemas()
      .get(schemaSaid)
      .catch(async (error) => {
        const status = error.message.split(" - ")[1];
        if (/404/gi.test(status)) {
          await this.connections.resolveOobi(
            `${ConfigurationService.env.keri.credentials.testServer.urlInt}/oobi/${schemaSaid}`
          );
          return await this.props.signifyClient.schemas().get(schemaSaid);
        } else {
          throw error;
        }
      });
    return {
      id: exchange.exn.e.acdc.d,
      schema: exchange.exn.e.acdc.s,
      i: exchange.exn.e.acdc.i,
      a: exchange.exn.e.acdc.a,
      s: {
        title: schema.title,
        description: schema.description,
        version: schema.version,
      },
      lastStatus: {
        s: exchange.exn.e.iss.s,
        dt: new Date(exchange.exn.e.iss.dt).toISOString(),
      },
      status: CredentialStatus.PENDING,
    };
  }

  async getLinkedGroupFromIpexGrant(id: string) {
    const grantNoteRecord = await this.notificationStorage.findById(id);

    if (!grantNoteRecord) {
      throw new Error(
        `${IpexCommunicationService.NOTIFICATION_NOT_FOUND} ${id}`
      );
    }

    const membersJoined: Set<string> = new Set();
    const linkedGroupRequest = grantNoteRecord.linkedGroupRequests;
    const exchange = await this.props.signifyClient
      .exchanges()
      .get(grantNoteRecord.a.d as string);

    const credentialSaid = exchange.exn.e.acdc.d;

    if (Object.keys(linkedGroupRequest).length) {
      const saids = linkedGroupRequest[credentialSaid].saids;

      for (const admitSaid in saids) {
        const memberDetails = saids[admitSaid];

        for (const memberInfo of memberDetails) {
          if (memberInfo.length > 0) {
            membersJoined.add(memberInfo[0]);
          }
        }
      }

      return {
        accepted: linkedGroupRequest[credentialSaid].accepted,
        membersJoined: Array.from(membersJoined),
      };
    } else {
      return {
        accepted: false,
        membersJoined: [],
      };
    }
  }
}

export { IpexCommunicationService };
