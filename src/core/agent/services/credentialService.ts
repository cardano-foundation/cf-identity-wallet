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
  CredentialDetails,
  CredentialShortDetails,
  ResidencyCredShortDetails,
  SummitCredShortDetails,
  UniversityCredShortDetails,
} from "../agent.types";
import { CredentialMetadataRecord } from "../modules";
import { AgentService } from "./agentService";
import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
} from "../modules/generalStorage/repositories/credentialMetadataRecord.types";
import { CredentialType } from "../../../ui/constants/dictionary";

class CredentialService extends AgentService {
  static readonly CREDENTIAL_MISSING_METADATA_ERROR_MSG =
    "Credential metadata missing for stored credential";
  static readonly CREDENTIAL_NOT_ARCHIVED = "Credential was not archived";
  static readonly CREDENTIAL_MISSING_FOR_NEGOTIATE =
    "Credential missing for negotiation";
  static readonly CREATED_DID_NOT_FOUND = "Referenced public did not found";

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
  ):
    | UniversityCredShortDetails
    | ResidencyCredShortDetails
    | SummitCredShortDetails
    | CredentialShortDetails {
    const data = {
      id: metadata.id,
      colors: metadata.colors,
      issuanceDate: metadata.issuanceDate,
      issuerLogo: metadata.issuerLogo,
      credentialType: metadata.credentialType,
      status: metadata.status,
    };
    if (
      metadata.credentialType === CredentialType.UNIVERSITY_DEGREE_CREDENTIAL
    ) {
      return {
        ...data,
        degreeType: metadata.degreeType,
      };
    } else if (
      metadata.credentialType === CredentialType.PERMANENT_RESIDENT_CARD
    ) {
      return {
        ...data,
        image: metadata.image,
        givenName: metadata.givenName,
        familyName: metadata.familyName,
        birthCountry: metadata.birthCountry,
        lprCategory: metadata.lprCategory,
        residentSince: metadata.residentSince,
      };
    } else if (
      metadata.credentialType === CredentialType.ACCESS_PASS_CREDENTIAL
    ) {
      return {
        ...data,
        summitType: metadata.summitType,
        startDate: metadata.startDate,
        endDate: metadata.endDate,
        passId: metadata.passId,
      };
    } else {
      return data;
    }
  }

  async getCredentialRecordById(id: string): Promise<CredentialExchangeRecord> {
    return this.agent.credentials.getById(id);
  }

  async getCredentialDetailsById(id: string): Promise<CredentialDetails> {
    const metadata = await this.getMetadataById(id);
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
  ): Promise<
    | UniversityCredShortDetails
    | ResidencyCredShortDetails
    | SummitCredShortDetails
    | CredentialShortDetails
  > {
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
    };

    if (credentialType === CredentialType.UNIVERSITY_DEGREE_CREDENTIAL) {
      const credentialMetadataRecord = {
        ...data,
        degreeType: universityDegreeCredSubject,
      };
      await this.agent.modules.generalStorage.updateCredentialMetadata(
        metadata?.id,
        credentialMetadataRecord
      );
      return {
        ...response,
        degreeType: credentialMetadataRecord.degreeType || "",
      };
    } else if (credentialType === CredentialType.PERMANENT_RESIDENT_CARD) {
      const credentialMetadataRecord = {
        ...data,
        image: checkedCredentialSubject?.image as string,
        givenName: checkedCredentialSubject?.givenName as string,
        familyName: checkedCredentialSubject?.familyName as string,
        birthCountry: checkedCredentialSubject?.birthCountry as string,
        lprCategory: checkedCredentialSubject?.lprCategory as string,
        residentSince: checkedCredentialSubject?.residentSince as string,
      };
      await this.agent.modules.generalStorage.updateCredentialMetadata(
        metadata?.id,
        credentialMetadataRecord
      );
      return {
        ...response,
        image: checkedCredentialSubject?.image as string,
        givenName: checkedCredentialSubject?.givenName as string,
        familyName: checkedCredentialSubject?.familyName as string,
        birthCountry: checkedCredentialSubject?.birthCountry as string,
        lprCategory: checkedCredentialSubject?.lprCategory as string,
        residentSince: checkedCredentialSubject?.residentSince as string,
      };
    } else if (credentialType === CredentialType.ACCESS_PASS_CREDENTIAL) {
      const credentialMetadataRecord = {
        ...data,
        summitType: checkedCredentialSubject?.type as string,
        startDate: checkedCredentialSubject?.startDate as string,
        endDate: checkedCredentialSubject?.endDate as string,
        passId: checkedCredentialSubject?.passId as string,
      };
      await this.agent.modules.generalStorage.updateCredentialMetadata(
        metadata?.id,
        credentialMetadataRecord
      );
      return {
        ...response,
        summitType: checkedCredentialSubject?.type as string,
        startDate: checkedCredentialSubject?.startDate as string,
        endDate: checkedCredentialSubject?.endDate as string,
        passId: checkedCredentialSubject?.passId as string,
      };
    } else {
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
}

export { CredentialService };
