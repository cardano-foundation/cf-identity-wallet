import {
  SignifyClient,
  ready as signifyReady,
  Tier,
  randomPasscode,
  Operation,
  Saider,
  Serder,
} from "signify-ts";
import { waitAndGetDoneOp } from "./utils";
import { config } from "../../config";
import { v4 as uuidv4 } from "uuid";
import { Agent } from "../../agent";

export class SignifyApi {
  static readonly DEFAULT_ROLE = "agent";
  static readonly FAILED_TO_RESOLVE_OOBI =
    "Failed to resolve OOBI, operation not completing...";
  static readonly UNKNOW_SCHEMA_ID = "Unknow Schema ID: ";
  private signifyClient!: SignifyClient;
  private opTimeout: number;
  private opRetryInterval: number;

  constructor(opTimeout = 15000, opRetryInterval = 250) {
    this.opTimeout = opTimeout;
    this.opRetryInterval = opRetryInterval;
  }

  /**
   * Must be called first.
   */
  async start(): Promise<void> {
    await signifyReady();
    this.signifyClient = new SignifyClient(
      config.keria.url,
      randomPasscode(), // Different on every restart but this is OK for our purposes.
      Tier.low,
      config.keria.bootUrl
    );
    try {
      await this.signifyClient.connect();
    } catch (err) {
      await this.signifyClient.boot();
      await this.signifyClient.connect();
    }
  }

  async createIdentifier(signifyName: string): Promise<any> {
    const op = await this.signifyClient.identifiers().create(signifyName);
    await op.op();
    const aid1 = await this.getIdentifierByName(signifyName);
    await this.signifyClient
      .identifiers()
      .addEndRole(
        signifyName,
        SignifyApi.DEFAULT_ROLE,
        this.signifyClient.agent!.pre
      );
    return aid1;
  }

  async getIdentifierByName(name: string): Promise<any> {
    return this.signifyClient.identifiers().get(name);
  }

  async getOobi(signifyName: string): Promise<any> {
    const result = await this.signifyClient
      .oobis()
      .get(signifyName, SignifyApi.DEFAULT_ROLE);
    return result.oobis[0];
  }

  async resolveOobi(url: string): Promise<any> {
    const alias = new URL(url).searchParams.get("name") ?? uuidv4();
    const operation = await waitAndGetDoneOp(
      this.signifyClient,
      await this.signifyClient.oobis().resolve(url, alias),
      this.opTimeout,
      this.opRetryInterval
    );
    if (!operation.done) {
      throw new Error(SignifyApi.FAILED_TO_RESOLVE_OOBI);
    }
    return operation;
  }

  async createRegistry(name: string): Promise<void> {
    const result = await this.signifyClient
      .registries()
      .create({ name, registryName: "vLEI" });
    await result.op();
    const registries = await this.signifyClient.registries().list(name);
    return registries[0].regk;
  }

  async issueCredential(
    issuerName: string,
    registryId: string,
    schemaId: string,
    recipient: string,
    attribute: { [key: string]: string }
  ) {
    await this.resolveOobi(`${config.oobiEndpoint}/oobi/${schemaId}`);

    let vcdata = {};
    if (
      schemaId === Agent.IIW_DEMO_SCHEMA_SAID ||
      schemaId === Agent.QVI_SCHEMA_SAID
    ) {
      vcdata = attribute;
    } else {
      throw new Error(SignifyApi.UNKNOW_SCHEMA_ID + schemaId);
    }

    const result = await this.signifyClient
      .credentials()
      .issue({ issuerName, registryId, schemaId, recipient, data: vcdata });
    await waitAndGetDoneOp(
      this.signifyClient,
      result.op,
      this.opTimeout,
      this.opRetryInterval
    );

    const datetime = new Date().toISOString().replace("Z", "000+00:00");
    const [grant, gsigs, gend] = await this.signifyClient.ipex().grant({
      senderName: issuerName,
      recipient,
      acdc: result.acdc,
      iss: result.iss,
      anc: result.anc,
      datetime,
    });
    await this.signifyClient
      .ipex()
      .submitGrant(issuerName, grant, gsigs, gend, [recipient]);
  }

  async issueQVICredential(
    issuerName: string,
    registryId: string,
    schemaId: string,
    recipientPrefix: string
  ) {
    await this.resolveOobi(`${config.oobiEndpoint}/oobi/${schemaId}`);

    let vcdata = {};
    if (schemaId === Agent.QVI_SCHEMA_SAID) {
      vcdata = {
        LEI: "5493001KJTIIGC8Y1R17",
        i: recipientPrefix,
      };
    } else {
      throw new Error(SignifyApi.UNKNOW_SCHEMA_ID + schemaId);
    }
    const result = await this.signifyClient.credentials().issue({
      issuerName,
      registryId,
      schemaId,
      recipient: recipientPrefix,
      data: vcdata,
    });
    await waitAndGetDoneOp(
      this.signifyClient,
      result.op,
      this.opTimeout,
      this.opRetryInterval
    );
    const issuerCredential = await this.signifyClient
      .credentials()
      .get(result.acdc.ked.d);
    const datetime = new Date().toISOString().replace("Z", "000+00:00");
    const [grant, gsigs, gend] = await this.signifyClient.ipex().grant({
      senderName: issuerName,
      recipient: recipientPrefix,
      acdc: new Serder(issuerCredential.sad),
      anc: new Serder(issuerCredential.anc),
      iss: new Serder(issuerCredential.iss),
      ancAttachment: issuerCredential.ancAttachment,
      datetime,
    });
    const smg = await this.signifyClient
      .ipex()
      .submitGrant(issuerName, grant, gsigs, gend, [recipientPrefix]);
    await waitAndGetDoneOp(
      this.signifyClient,
      smg,
      this.opTimeout,
      this.opRetryInterval
    );
    return result.acdc.ked.d;
  }

  async admitCredential(
    holderAidName: string,
    d: string,
    issuerAidPrefix: string
  ) {
    const [admit, sigs, aend] = await this.signifyClient
      .ipex()
      .admit(
        holderAidName,
        "",
        d,
        new Date().toISOString().replace("Z", "000+00:00")
      );
    const op = await this.signifyClient
      .ipex()
      .submitAdmit(holderAidName, admit, sigs, aend, [issuerAidPrefix]);
    await waitAndGetDoneOp(
      this.signifyClient,
      op,
      this.opTimeout,
      this.opRetryInterval
    );
  }

  async leChainedCredential(
    qviCredentialId: string,
    registryId: string,
    holderAidName: string,
    legalEntityAidPrefix: string,
    attribute: { [key: string]: string }
  ) {
    await this.resolveOobi(
      `${config.oobiEndpoint}/oobi/${Agent.LE_SCHEMA_SAID}`
    );
    await this.resolveOobi(
      `${config.oobiEndpoint}/oobi/${Agent.QVI_SCHEMA_SAID}`
    );
    const qviCredential = await this.signifyClient
      .credentials()
      .get(qviCredentialId);
    const result = await this.signifyClient.credentials().issue({
      issuerName: holderAidName,
      data: {
        i: legalEntityAidPrefix,
        ...attribute,
      },
      registryId: registryId,
      schemaId: Agent.LE_SCHEMA_SAID,
      rules: Saider.saidify({
        d: "",
        usageDisclaimer: {
          l: "Usage of a valid, unexpired, and non-revoked vLEI Credential, as defined in the associated Ecosystem Governance Framework, does not assert that the Legal Entity is trustworthy, honest, reputable in its business dealings, safe to do business with, or compliant with any laws or that an implied or expressly intended purpose will be fulfilled.",
        },
        issuanceDisclaimer: {
          l: "All information in a valid, unexpired, and non-revoked vLEI Credential, as defined in the associated Ecosystem Governance Framework, is accurate as of the date the validation process was complete. The vLEI Credential has been issued to the legal entity or person named in the vLEI Credential as the subject; and the qualified vLEI Issuer exercised reasonable care to perform the validation process set forth in the vLEI Ecosystem Governance Framework.",
        },
      })[1],
      recipient: legalEntityAidPrefix,
      source: Saider.saidify({
        d: "",
        qvi: {
          n: qviCredential.sad.d,
          s: qviCredential.sad.s,
        },
      })[1],
    });

    const leCredential = await this.signifyClient
      .credentials()
      .get(result.acdc.ked.d);

    await waitAndGetDoneOp(
      this.signifyClient,
      result.op,
      this.opTimeout,
      this.opRetryInterval
    );

    const [grant, gsigs, gend] = await this.signifyClient.ipex().grant({
      senderName: holderAidName,
      acdc: new Serder(leCredential.sad),
      anc: new Serder(leCredential.anc),
      iss: new Serder(leCredential.iss),
      ancAttachment: leCredential.ancAttachment,
      recipient: legalEntityAidPrefix,
      datetime: new Date().toISOString().replace("Z", "000+00:00"),
    });
    await this.signifyClient
      .ipex()
      .submitGrant(holderAidName, grant, gsigs, gend, [legalEntityAidPrefix]);
    return result.acdc.ked.d;
  }

  async requestDisclosure(
    senderName: string,
    schemaSaid: string,
    recipient: string,
    attributes: { [key: string]: string }
  ) {
    const [apply, sigs] = await this.signifyClient.ipex().apply({
      senderName,
      recipient,
      schema: schemaSaid,
      attributes,
    });
    await this.signifyClient
      .ipex()
      .submitApply(senderName, apply, sigs, [recipient]);
  }

  async contacts(): Promise<any> {
    return this.signifyClient.contacts().list();
  }

  async agreeToAcdcFromOffer(
    senderName: string,
    offerSaid: string,
    recipient: string
  ) {
    const [apply, sigs] = await this.signifyClient.ipex().agree({
      senderName,
      recipient,
      offer: offerSaid,
    });
    await this.signifyClient
      .ipex()
      .submitAgree(senderName, apply, sigs, [recipient]);
  }

  async getNotifications() {
    return this.signifyClient.notifications().list();
  }

  async deleteNotification(said: string) {
    return this.signifyClient.notifications().delete(said);
  }

  async getExchangeMsg(said: string) {
    return this.signifyClient.exchanges().get(said);
  }

  async revokeCredential(issuerName: string, holder: string, credentialId: string) {
    const result = await this.signifyClient.credentials().revoke(issuerName, credentialId);
    await waitAndGetDoneOp(
      this.signifyClient,
      result.op,
      this.opTimeout,
      this.opRetryInterval
    );
    const credential = await this.signifyClient.credentials().get(credentialId);
    const datetime = new Date().toISOString().replace("Z", "000+00:00");
    const [grant, gsigs, gend] = await this.signifyClient.ipex().grant({
      senderName: issuerName,
      recipient: holder,
      acdc: new Serder(credential.sad),
      anc: new Serder(credential.anc),
      iss: new Serder(credential.iss),
      datetime,
    });
    const submitGrantOp = await this.signifyClient
      .ipex()
      .submitGrant(issuerName, grant, gsigs, gend, [holder]);
    await waitAndGetDoneOp(
      this.signifyClient,
      submitGrantOp,
      this.opTimeout,
      this.opRetryInterval
    );
  }
  /**
   * Note - op must be of type any here until Signify cleans up its typing.
   */
  private async waitAndGetDoneOp(
    op: Operation,
    timeout: number,
    interval: number
  ): Promise<Operation> {
    const startTime = new Date().getTime();
    while (!op.done && new Date().getTime() < startTime + timeout) {
      op = await this.signifyClient.operations().get(op.name);
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    return op;
  }
}
