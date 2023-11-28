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
  CredentialDetails,
  CredentialShortDetails,
  CredentialStatus,
  Notification,
} from "./credentialService.types";

class CredentialService extends AgentService {
  static readonly CREDENTIAL_MISSING_METADATA_ERROR_MSG =
    "Credential metadata missing for stored credential";
  static readonly CREDENTIAL_NOT_ARCHIVED = "Credential was not archived";
  static readonly CREDENTIAL_MISSING_FOR_NEGOTIATE =
    "Credential missing for negotiation";
  static readonly CREATED_DID_NOT_FOUND = "Referenced public did not found";
  static readonly KERI_NOTIFICATION_NOT_FOUND =
    "Keri notification record not found";
  static readonly ISSUEE_NOT_FOUND =
    "Cannot accept incoming ACDC, issuee AID not controlled by us";

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

  async processNotification(
    notif: Notification,
    callback: (event: KeriNotification) => void
  ) {
    if (notif.a.r === "/exn/ipex/grant" && notif.r === false) {
      const keriNoti = await this.createKeriNotificationRecord(notif);
      callback(keriNoti);
    }
  }

  async onNotificationKeriStateChanged(
    callback: (event: KeriNotification) => void
  ) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const notifications = await this.agent.modules.signify.getNotifications();
      for (const notif of notifications.notes) {
        await this.processNotification(notif, callback);
      }
      await new Promise((rs) => {
        setTimeout(() => {
          rs(true);
        }, 2000);
      });
    }
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
    return listMetadatas.map((element: CredentialMetadataRecord) =>
      this.getCredentialShortDetails(element)
    );
  }

  getCredentialShortDetails(
    metadata: CredentialMetadataRecord
  ): CredentialShortDetails {
    return {
      id: metadata.id,
      colors: metadata.colors,
      issuanceDate: metadata.issuanceDate,
      issuerLogo: metadata.issuerLogo,
      credentialType: metadata.credentialType,
      status: metadata.status,
      cachedDetails: metadata.cachedDetails,
      connectionType: metadata.connectionType,
    };
  }

  async getCredentialRecordById(id: string): Promise<CredentialExchangeRecord> {
    return this.agent.credentials.getById(id);
  }

  async getCredentialDetailsById(id: string): Promise<CredentialDetails> {
    const metadata = await this.getMetadataById(id);
    if (metadata.connectionType === ConnectionType.KERI) {
      const acdc = await this.agent.modules.signify.getCredentialBySaid(
        metadata.credentialRecordId
      );
      return {
        ...this.getCredentialShortDetails(metadata),
        type: acdc.schema.credentialType,
        credentialSubject: acdc.sad.a,
        proofType: "keri", // TODO: must define
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

    const connection = await this.agent.connections.findById(
      credentialRecord?.connectionId ?? ""
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
    const universityDegreeCredSubject = Array.isArray(credentialSubject)
      ? undefined
      : ((credentialSubject.degree as JsonObject)?.type as string);
    const checkedCredentialSubject = Array.isArray(credentialSubject)
      ? undefined
      : credentialSubject;
    const response = {
      colors: metadata.colors,
      credentialType: data.credentialType || "",
      id: metadata.id,
      isArchived: metadata.isArchived ?? false,
      issuanceDate: metadata.issuanceDate,
      issuerLogo: connection?.imageUrl ?? undefined,
      status: data.status,
      connectionType: metadata.connectionType,
    };

    if (credentialType === CredentialType.UNIVERSITY_DEGREE_CREDENTIAL) {
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
    await this.agent.modules.generalStorage.deleteCredentialMetadata(id);
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
      this.getKeriNotifications(),
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

  async getMetadataById(id: string): Promise<CredentialMetadataRecord> {
    const metadata =
      await this.agent.modules.generalStorage.getCredentialMetadata(id);
    if (!metadata) {
      throw new Error(CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG);
    }
    return metadata;
  }

  private async createKeriNotificationRecord(
    event: Notification
  ): Promise<KeriNotification> {
    const result = await this.agent.genericRecords.save({
      id: event.i,
      content: event.a,
      tags: {
        type: GenericRecordType.NOTIFICATION_KERI,
      },
    });
    return {
      id: result.id,
      createdAt: result.createdAt,
      a: result.content,
    };
  }

  private async getKeriNotifications(): Promise<KeriNotification[]> {
    const results = await this.agent.genericRecords.findAllByQuery({
      type: GenericRecordType.NOTIFICATION_KERI,
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
    const credentialId = event.e.acdc.d;
    const credentialDetails: CredentialShortDetails = {
      id: `metadata:${credentialId}`,
      isArchived: false,
      colors: new ColorGenerator().generateNextColor() as [string, string],
      credentialType: "",
      issuanceDate: event.e.acdc.a.dt,
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
  ): Promise<void> {
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
    const cred = await this.waitForCredentialToAppear(credentialId);
    await this.updateAcdcMetadataRecordCompleted(credentialId, cred);
    await this.deleteKeriNotificationRecordById(id);
    this.agent.events.emit<AcdcKeriStateChangedEvent>(this.agent.context, {
      type: AcdcKeriEventTypes.AcdcKeriStateChanged,
      payload: {
        credentialId,
        status: CredentialStatus.CONFIRMED,
      },
    });
  }

  private async waitForCredentialToAppear(credentialId: string): Promise<any> {
    let cred = await this.agent.modules.signify.getCredentialBySaid(
      credentialId
    );
    let retryTimes = 0;
    while (!cred) {
      if (retryTimes > 15) {
        throw new Error(CredentialService.CREDENTIAL_NOT_ARCHIVED);
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
      cred = await this.agent.modules.signify.getCredentialBySaid(credentialId);
      retryTimes++;
    }
    return cred;
  }
}

export { CredentialService };
