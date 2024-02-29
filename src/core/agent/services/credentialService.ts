import {
  AutoAcceptCredential,
  CredentialEventTypes,
  CredentialExchangeRecord,
  CredentialState,
  CredentialStateChangedEvent,
  ProposeCredentialOptions,
  V2OfferCredentialMessage,
  AriesFrameworkError,
  JsonCredential,
  JsonLdCredentialDetailFormat,
  W3cJsonLdVerifiableCredential,
  JsonObject,
} from "@aries-framework/core";
import {
  KeriNotification,
  GenericRecordType,
  AcdcKeriStateChangedEvent,
  AcdcKeriEventTypes,
  ConnectionType,
  CredentialType,
} from "../agent.types";
import { CredentialMetadataRecord } from "../modules";
import { AgentService } from "./agentService";
import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
} from "../modules/generalStorage/repositories/credentialMetadataRecord.types";
import { ColorGenerator } from "../../../ui/utils/colorGenerator";
import {
  W3CCredentialDetails,
  CredentialShortDetails,
  CredentialStatus,
  ACDCDetails,
} from "./credentialService.types";
import { NotificationRoute } from "../modules/signify/signifyApi.types";

class CredentialService extends AgentService {
  static readonly CREDENTIAL_MISSING_METADATA_ERROR_MSG =
    "Credential metadata missing for stored credential";
  static readonly CREDENTIAL_NOT_ARCHIVED = "Credential was not archived";
  static readonly ACDC_NOT_APPEARING = "ACDC is not appearing..."; // @TODO - foconnor: This is async we should wait for a notification
  static readonly CREDENTIAL_MISSING_FOR_NEGOTIATE =
    "Credential missing for negotiation";
  static readonly CREATED_DID_NOT_FOUND = "Referenced public did not found";
  static readonly KERI_NOTIFICATION_NOT_FOUND =
    "Keri notification record not found";
  static readonly ISSUEE_NOT_FOUND =
    "Cannot accept incoming ACDC, issuee AID not controlled by us";
  static readonly CREDENTIAL_NOT_FOUND =
    "Credential with given SAID not found on KERIA";

  onCredentialStateChanged(
    callback: (event: CredentialStateChangedEvent) => void
  ) {
    this.agent.events.on(
      CredentialEventTypes.CredentialStateChanged,
      async (event: CredentialStateChangedEvent) => {
        callback(event);
      }
    );
  }

  onAcdcKeriStateChanged(callback: (event: AcdcKeriStateChangedEvent) => void) {
    this.agent.events.on(
      AcdcKeriEventTypes.AcdcKeriStateChanged,
      async (event: AcdcKeriStateChangedEvent) => {
        callback(event);
      }
    );
  }

  /**
   * Role: holder, check to see if incoming credential offer received
   * @param credentialRecord
   */
  isCredentialOfferReceived(credentialRecord: CredentialExchangeRecord) {
    return (
      credentialRecord.state === CredentialState.OfferReceived &&
      !credentialRecord.autoAcceptCredential
    );
  }

  isCredentialDone(credentialRecord: CredentialExchangeRecord) {
    return credentialRecord.state === CredentialState.Done;
  }

  isCredentialRequestSent(credentialRecord: CredentialExchangeRecord) {
    return (
      credentialRecord.state === CredentialState.RequestSent &&
      !credentialRecord.autoAcceptCredential
    );
  }

  async acceptCredentialOffer(credentialRecordId: string) {
    await this.agent.credentials.acceptOffer({ credentialRecordId });
  }

  async declineCredentialOffer(credentialRecordId: string) {
    await this.agent.credentials.declineOffer(credentialRecordId);
  }

  async proposeCredential(
    connectionId: string,
    credentialFormats: ProposeCredentialOptions["credentialFormats"]
  ) {
    return this.agent.credentials.proposeCredential({
      protocolVersion: "v2",
      connectionId: connectionId,
      credentialFormats: credentialFormats,
      autoAcceptCredential: AutoAcceptCredential.Always,
    });
  }

  async getCredentials(
    isGetArchive = false
  ): Promise<CredentialShortDetails[]> {
    const listMetadatas =
      await this.agent.modules.generalStorage.getAllCredentialMetadata(
        isGetArchive
      );
    //only get credentials that are not deleted
    return listMetadatas
      .filter((item) => !item.isDeleted)
      .map((element: CredentialMetadataRecord) =>
        this.getCredentialShortDetails(element)
      );
  }

  private getCredentialShortDetails(
    metadata: CredentialMetadataRecord
  ): CredentialShortDetails {
    return {
      id: metadata.id,
      colors: metadata.colors,
      issuanceDate: metadata.issuanceDate,
      credentialType: metadata.credentialType,
      status: metadata.status,
      cachedDetails: metadata.cachedDetails,
      connectionType: metadata.connectionType,
    };
  }

  async getCredentialShortDetailsById(
    id: string
  ): Promise<CredentialShortDetails> {
    return this.getCredentialShortDetails(await this.getMetadataById(id));
  }

  async getCredentialRecordById(id: string): Promise<CredentialExchangeRecord> {
    return this.agent.credentials.getById(id);
  }

  async getCredentialDetailsById(
    id: string
  ): Promise<W3CCredentialDetails | ACDCDetails> {
    const metadata = await this.getMetadataById(id);
    if (metadata.connectionType === ConnectionType.KERI) {
      const { acdc, error } =
        await this.agent.modules.signify.getCredentialBySaid(
          metadata.credentialRecordId
        );
      if (error) {
        throw error;
      }
      if (!acdc) {
        throw new Error(CredentialService.CREDENTIAL_NOT_FOUND);
      }
      return {
        ...this.getCredentialShortDetails(metadata),
        i: acdc.sad.i,
        a: acdc.sad.a,
        s: {
          title: acdc.schema.title,
          description: acdc.schema.description,
          version: acdc.schema.version,
        },
        lastStatus: {
          s: acdc.status.s,
          dt: new Date(acdc.status.dt).toISOString(),
        },
        connectionType: ConnectionType.KERI,
      };
    }
    const credentialRecord = await this.getCredentialRecordById(
      metadata.credentialRecordId
    );
    // current, get first credential, handle later
    const w3cCredential =
      await this.agent.w3cCredentials.getCredentialRecordById(
        credentialRecord.credentials[0].credentialRecordId
      );
    const credentialSubject = w3cCredential.credential
      .credentialSubject as any as JsonCredential["credentialSubject"];
    const credential =
      w3cCredential.credential as W3cJsonLdVerifiableCredential;
    const proof = credential.proof;
    return {
      ...this.getCredentialShortDetails(metadata),
      type: w3cCredential.credential.type,
      connectionId: credentialRecord.connectionId,
      expirationDate: w3cCredential.credential?.expirationDate,
      credentialSubject: credentialSubject,
      proofType: Array.isArray(proof)
        ? proof.map((p) => p.type).join(",")
        : proof.type,
      proofValue: Array.isArray(proof)
        ? proof.map((p) => p.jws).join(",")
        : proof.jws,
      connectionType: ConnectionType.DIDCOMM,
    };
  }

  async getPreviewCredential(credentialRecord: CredentialExchangeRecord) {
    const v2OfferCredentialMessage: V2OfferCredentialMessage | null =
      await this.agent.credentials.findOfferMessage(credentialRecord.id);
    if (!v2OfferCredentialMessage) {
      return null;
    }
    const attachments = v2OfferCredentialMessage.offerAttachments;
    // Current, get first attachment, handle later
    const attachment = attachments?.[0];
    if (!attachment) {
      return null;
    }
    return attachment.getDataAsJson<JsonLdCredentialDetailFormat>();
  }

  async createMetadata(data: CredentialMetadataRecordProps) {
    const metadataRecord = new CredentialMetadataRecord({
      ...data,
    });
    await this.agent.modules.generalStorage.saveCredentialMetadataRecord(
      metadataRecord
    );
  }

  async updateMetadataCompleted(
    credentialRecord: CredentialExchangeRecord
  ): Promise<CredentialShortDetails> {
    const metadata =
      await this.agent.modules.generalStorage.getCredentialMetadataByCredentialRecordId(
        credentialRecord.id
      );
    const w3cCredential =
      await this.agent.w3cCredentials.getCredentialRecordById(
        credentialRecord.credentials[0].credentialRecordId
      );

    if (!metadata) {
      throw new AriesFrameworkError(
        CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
      );
    }
    const credentialType = w3cCredential.credential.type?.find(
      (t) => t !== "VerifiableCredential"
    );
    const data = {
      credentialType: credentialType,
      status: CredentialMetadataRecordStatus.CONFIRMED,
    };

    const credentialSubject = w3cCredential.credential
      .credentialSubject as any as JsonCredential["credentialSubject"];
    const checkedCredentialSubject = Array.isArray(credentialSubject)
      ? undefined
      : credentialSubject;
    const response = {
      colors: metadata.colors,
      credentialType: data.credentialType || "",
      id: metadata.id,
      isArchived: metadata.isArchived ?? false,
      issuanceDate: metadata.issuanceDate,
      status: data.status,
      connectionType: metadata.connectionType,
    };

    if (credentialType === CredentialType.UNIVERSITY_DEGREE_CREDENTIAL) {
      const universityDegreeCredSubject = (
        checkedCredentialSubject?.degree as JsonObject
      )?.type as string;
      const credentialMetadataRecord = {
        ...data,
        cachedDetails: {
          degreeType: universityDegreeCredSubject || "",
        },
      };
      await this.agent.modules.generalStorage.updateCredentialMetadata(
        metadata?.id,
        credentialMetadataRecord
      );
      return {
        ...response,
        cachedDetails: credentialMetadataRecord.cachedDetails,
      };
    } else if (credentialType === CredentialType.PERMANENT_RESIDENT_CARD) {
      const expirationDate = w3cCredential.credential.expirationDate;
      const credentialMetadataRecord = {
        ...data,
        cachedDetails: {
          expirationDate: expirationDate || "",
          image: checkedCredentialSubject?.image as string,
          givenName: checkedCredentialSubject?.givenName as string,
          familyName: checkedCredentialSubject?.familyName as string,
          birthCountry: checkedCredentialSubject?.birthCountry as string,
          lprCategory: checkedCredentialSubject?.lprCategory as string,
          residentSince: checkedCredentialSubject?.residentSince as string,
        },
      };
      await this.agent.modules.generalStorage.updateCredentialMetadata(
        metadata?.id,
        credentialMetadataRecord
      );
      return {
        ...response,
        cachedDetails: credentialMetadataRecord.cachedDetails,
      };
    } else if (credentialType === CredentialType.ACCESS_PASS_CREDENTIAL) {
      const credentialMetadataRecord = {
        ...data,
        cachedDetails: {
          summitType: checkedCredentialSubject?.type as string,
          startDate: checkedCredentialSubject?.startDate as string,
          endDate: checkedCredentialSubject?.endDate as string,
          passId: checkedCredentialSubject?.passId as string,
        },
      };
      await this.agent.modules.generalStorage.updateCredentialMetadata(
        metadata?.id,
        credentialMetadataRecord
      );
      return {
        ...response,
        cachedDetails: credentialMetadataRecord.cachedDetails,
      };
    } else {
      await this.agent.modules.generalStorage.updateCredentialMetadata(
        metadata?.id,
        data
      );
      return response;
    }
  }

  async archiveCredential(id: string): Promise<void> {
    await this.agent.modules.generalStorage.updateCredentialMetadata(id, {
      isArchived: true,
    });
  }

  async deleteCredential(id: string): Promise<void> {
    const metadata = await this.getMetadataById(id);
    this.validArchivedCredential(metadata);
    //With KERI, we only soft delete because we need to sync with KERIA. This will prevent re-sync deleted records.
    if (metadata.connectionType === ConnectionType.KERI) {
      await this.agent.modules.generalStorage.updateCredentialMetadata(id, {
        ...metadata,
        isDeleted: true,
      });
    } else {
      await this.agent.modules.generalStorage.deleteCredentialMetadata(id);
    }
  }

  async restoreCredential(id: string): Promise<void> {
    const metadata = await this.getMetadataById(id);
    this.validArchivedCredential(metadata);
    await this.agent.modules.generalStorage.updateCredentialMetadata(id, {
      isArchived: false,
    });
  }

  async negotiateOfferWithDid(
    subjectDid: string,
    credentialExchangeRecord: CredentialExchangeRecord
  ): Promise<void> {
    const [createdDid] = await this.agent.dids.getCreatedDids({
      did: subjectDid,
    });
    if (!createdDid) {
      throw new Error(`${CredentialService.CREATED_DID_NOT_FOUND}`);
    }
    const w3cCredential = await this.getPreviewCredential(
      credentialExchangeRecord
    );
    if (!w3cCredential) {
      throw new Error(`${CredentialService.CREDENTIAL_MISSING_FOR_NEGOTIATE}`);
    }
    await this.agent.credentials.negotiateOffer({
      credentialRecordId: credentialExchangeRecord.id,
      credentialFormats: {
        jsonld: {
          ...w3cCredential,
          credential: {
            ...w3cCredential.credential,
            credentialSubject: {
              ...w3cCredential.credential.credentialSubject,
              id: subjectDid,
            },
          },
        },
      },
    });
  }

  async getUnhandledCredentials(): Promise<
    (CredentialExchangeRecord | KeriNotification)[]
    > {
    const results = await Promise.all([
      this.agent.credentials.findAllByQuery({
        state: CredentialState.OfferReceived,
      }),
      this.getKeriCredentialNotifications(),
    ]);
    return results.flat();
  }

  private validArchivedCredential(metadata: CredentialMetadataRecord): void {
    if (!metadata.isArchived) {
      throw new Error(
        `${CredentialService.CREDENTIAL_NOT_ARCHIVED} ${metadata.id}`
      );
    }
  }

  private async getMetadataById(id: string): Promise<CredentialMetadataRecord> {
    const metadata =
      await this.agent.modules.generalStorage.getCredentialMetadata(id);
    if (!metadata) {
      throw new Error(CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG);
    }
    return metadata;
  }

  private async getKeriCredentialNotifications(): Promise<KeriNotification[]> {
    const results = await this.agent.genericRecords.findAllByQuery({
      type: GenericRecordType.NOTIFICATION_KERI,
      route: NotificationRoute.Credential,
    });
    return results.map((result) => {
      return {
        id: result.id,
        createdAt: result.createdAt,
        a: result.content,
      };
    });
  }

  private async createAcdcMetadataRecord(event: any): Promise<void> {
    await this.saveAcdcMetadataRecord(event.e.acdc.d, event.e.acdc.a.dt);
  }

  private async saveAcdcMetadataRecord(
    credentialId: string,
    dateTime: string
  ): Promise<void> {
    const credentialDetails: CredentialShortDetails = {
      id: `metadata:${credentialId}`,
      isArchived: false,
      colors: new ColorGenerator().generateNextColor() as [string, string],
      credentialType: "",
      issuanceDate: new Date(dateTime).toISOString(),
      status: CredentialMetadataRecordStatus.PENDING,
      connectionType: ConnectionType.KERI,
    };
    await this.createMetadata({
      ...credentialDetails,
      credentialRecordId: credentialId,
    });
  }

  private async updateAcdcMetadataRecordCompleted(
    id: string,
    cred: any
  ): Promise<CredentialShortDetails> {
    const metadata =
      await this.agent.modules.generalStorage.getCredentialMetadataByCredentialRecordId(
        id
      );
    if (!metadata) {
      throw new AriesFrameworkError(
        CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
      );
    }

    metadata.status = CredentialMetadataRecordStatus.CONFIRMED;
    metadata.credentialType = cred.schema?.title;
    await this.agent.modules.generalStorage.updateCredentialMetadata(
      metadata.id,
      metadata
    );
    return this.getCredentialShortDetails(metadata);
  }

  private async getKeriNotificationRecordById(
    id: string
  ): Promise<KeriNotification> {
    const result = await this.agent.genericRecords.findById(id);
    if (!result) {
      throw new Error(`${CredentialService.KERI_NOTIFICATION_NOT_FOUND} ${id}`);
    }
    return {
      id: result.id,
      createdAt: result.createdAt,
      a: result.content,
    };
  }

  async deleteKeriNotificationRecordById(id: string): Promise<void> {
    await this.agent.genericRecords.deleteById(id);
  }

  async acceptKeriAcdc(id: string): Promise<void> {
    const keriNoti = await this.getKeriNotificationRecordById(id);
    const keriExchange = await this.agent.modules.signify.getKeriExchange(
      keriNoti.a.d as string
    );
    const credentialId = keriExchange.exn.e.acdc.d;
    await this.createAcdcMetadataRecord(keriExchange.exn);

    this.agent.events.emit<AcdcKeriStateChangedEvent>(this.agent.context, {
      type: AcdcKeriEventTypes.AcdcKeriStateChanged,
      payload: {
        credentialId,
        status: CredentialStatus.PENDING,
      },
    });
    let holderSignifyName;
    const holder =
      await this.agent.modules.generalStorage.getIdentifierMetadata(
        keriExchange.exn.a.i
      );
    if (holder && holder.signifyName) {
      holderSignifyName = holder.signifyName;
    } else {
      const identifierHolder =
        await this.agent.modules.signify.getIdentifierById(
          keriExchange.exn.a.i
        );
      holderSignifyName = identifierHolder?.name;
    }
    if (!holderSignifyName) {
      throw new Error(CredentialService.ISSUEE_NOT_FOUND);
    }

    await this.agent.modules.signify.admitIpex(
      keriNoti.a.d as string,
      holderSignifyName,
      keriExchange.exn.i
    );

    // @TODO - foconnor: This should be event driven, need to fix the notification in KERIA/Signify.
    const cred = await this.waitForAcdcToAppear(credentialId);
    const credentialShortDetails = await this.updateAcdcMetadataRecordCompleted(
      credentialId,
      cred
    );
    await this.deleteKeriNotificationRecordById(id);
    this.agent.events.emit<AcdcKeriStateChangedEvent>(this.agent.context, {
      type: AcdcKeriEventTypes.AcdcKeriStateChanged,
      payload: {
        status: CredentialStatus.CONFIRMED,
        credential: credentialShortDetails,
      },
    });
  }

  private async waitForAcdcToAppear(credentialId: string): Promise<any> {
    let { acdc } = await this.agent.modules.signify.getCredentialBySaid(
      credentialId
    );
    let retryTimes = 0;
    while (!acdc) {
      if (retryTimes > 120) {
        throw new Error(CredentialService.ACDC_NOT_APPEARING);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      acdc = (
        await this.agent.modules.signify.getCredentialBySaid(credentialId)
      ).acdc;
      retryTimes++;
    }
    return acdc;
  }

  async syncACDCs() {
    const signifyCredentials =
      await this.agent.modules.signify.getCredentials();
    const storedCredentials =
      await this.agent.modules.generalStorage.getAllCredentialMetadata();
    const unSyncedData = signifyCredentials.filter(
      (credential: any) =>
        !storedCredentials.find(
          (item) => credential.sad.d === item.credentialRecordId
        )
    );
    if (unSyncedData.length) {
      //sync the storage with the signify data
      for (const credential of unSyncedData) {
        await this.saveAcdcMetadataRecord(
          credential.sad.d,
          credential.sad.a.dt
        );
      }
    }
  }

  private async waitForEnterpriseAcdcToAppear(
    serverAid: string,
    expectedDomain: string,
    retryTimes: number,
    triedTime = 0
  ) {
    const notificationsList =
      await this.agent.modules.signify.getNotifications();
    let unreadGrantNotes = notificationsList.notes.filter(
      (note: any) => !note.r && note.a.r === "/tunnel/server/request"
    );
    unreadGrantNotes = await Promise.all(
      unreadGrantNotes.map(async (note: any) => {
        const exchange = await this.agent.modules.signify.getKeriExchange(
          note.a.d
        );
        return {
          notiId: note.i,
          notiSaid: note.a.d,
          exchange,
        };
      })
    );
    unreadGrantNotes = unreadGrantNotes.filter(
      (notification: any) =>
        notification.exchange.exn.i === serverAid &&
        notification.exchange.exn.e.acdc &&
        notification.exchange.exn.e.acdc === expectedDomain
    );
    triedTime++;
    while (!unreadGrantNotes?.length) {
      if (triedTime > retryTimes) {
        throw new Error(CredentialService.ACDC_NOT_APPEARING);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.waitForEnterpriseAcdcToAppear(
        serverAid,
        expectedDomain,
        retryTimes,
        triedTime
      );
    }
    return unreadGrantNotes;
  }

  private async callEnterpriseResolveOobi(
    serverEndpoint: string,
    oobiUrl: string
  ) {
    await fetch(`${serverEndpoint}/resolve-oobi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oobiUrl: oobiUrl }),
    });
  }

  private async callEnterpriseDiscloseAcdc(
    serverEndpoint: string,
    aidPrefix: string,
    schemaSaid: string
  ) {
    await fetch(`${serverEndpoint}/disclosure-acdc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        aidPrefix: aidPrefix,
        schemaSaid,
      }),
    });
  }

  async handleReqGrant(id: string) {
    //TODO: hard fix the value at the moment, may need to change these in the future
    const enterpriseServerEndpoint = "http://localhost:3001";
    const schemaSaid = "EGjD1gCLi9ecZSZp9zevkgZGyEX_MbOdmhBFt4o0wvdb";
    const tunnelAid = "EBDX49akYZ9g_TplwZn1ounNRMtx7SJEmdBuhw4mjSIp";
    const keriNoti = await this.getKeriNotificationRecordById(id);
    const exchange = await this.agent.modules.signify.getKeriExchange(
      keriNoti.a.d as string
    );
    const sender = exchange.exn.i;
    if (sender !== tunnelAid) {
      throw new Error();
    }
    const credentials = await this.agent.modules.signify.getCredentials(
      exchange.exn.a.filter
    );
    if (!credentials.length) {
      throw new Error();
    }
    const serverOobiUrl = exchange.exn.a.serverOobiUrl;
    const resolveServerOobiResult =
      await this.agent.modules.signify.resolveOobi(serverOobiUrl);
    const serverAid = resolveServerOobiResult.response.i;
    const identitiers = await this.agent.modules.signify.getAllIdentifiers();
    //TODO: May need to create a screen to select which identifier will be used
    const selectedIdentifier = identitiers.aids[0];
    const idWalletOobiUrl = await this.agent.modules.signify.getOobi(
      selectedIdentifier.name
    );
    /**Resolve OOBI */
    await this.callEnterpriseResolveOobi(
      enterpriseServerEndpoint,
      idWalletOobiUrl
    );
    /**Disclose ACDC */
    await this.callEnterpriseDiscloseAcdc(
      enterpriseServerEndpoint,
      selectedIdentifier.prefix,
      schemaSaid
    );
    /**Mark notification as read and admit it*/
    const unreadGrantNotes = await this.waitForEnterpriseAcdcToAppear(
      serverAid,
      enterpriseServerEndpoint,
      5
    );
    const latestGrant = unreadGrantNotes.reduce(
      (latestObj: any, currentObj: any) => {
        const maxDateTime = latestObj.exchange.exn.a.dt;
        const currentDateTime = currentObj.exchange.exn.a.dt;
        return currentDateTime > maxDateTime ? currentObj : latestObj;
      }
    );
    await this.agent.modules.signify.markNotification(latestGrant.notiId);
    await this.agent.modules.signify.admitIpex(
      latestGrant.notiSaid,
      selectedIdentifier.name,
      latestGrant.exchange.exn.i
    );
    /**do an IPEX exchange of the holding ACDC */
    const acdc = credentials[0];
    await this.agent.modules.signify.grantAcdcIpexExchange(
      selectedIdentifier.name,
      acdc,
      serverAid
    );
    /**Send exchange message that contains the tunnel AID */
    const selectedAid = await this.agent.modules.signify.getIdentifierByName(
      selectedIdentifier.name
    );
    await this.agent.modules.signify.sendExn(
      selectedIdentifier.name,
      selectedAid,
      "grant",
      NotificationRoute.GrantRequest,
      {},
      [serverAid],
      {
        sid: tunnelAid,
      }
    );
  }

  async getUnhandledReqGrantEvents(): Promise<KeriNotification[]> {
    const results = await this.agent.genericRecords.findAllByQuery({
      type: GenericRecordType.NOTIFICATION_KERI,
      route: NotificationRoute.GrantRequest,
      $or: [{ route: NotificationRoute.GrantRequest }],
    });
    return results.map((result) => {
      return {
        id: result.id,
        createdAt: result.createdAt,
        a: result.content,
      };
    });
  }
}

export { CredentialService };
