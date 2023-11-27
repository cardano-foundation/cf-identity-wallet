import { utils } from "@aries-framework/core";
import {
  d,
  messagize,
  Serder,
  Siger,
  SignifyClient,
  ready as signifyReady,
  Tier,
} from "signify-ts";
import { AriesAgent } from "../../ariesAgent";

export class SignifyApi {
  static readonly LOCAL_KERIA_ENDPOINT =
    "https://dev.keria.cf-keripy.metadata.dev.cf-deployments.org";
  static readonly LOCAL_KERIA_BOOT_ENDPOINT =
    "https://dev.keria-boot.cf-keripy.metadata.dev.cf-deployments.org";
  static readonly SIGNIFY_BRAN = "o123456a89aacxeaCaxkd"; // @TODO - foconnor: Shouldn't be hard-coded.
  static readonly BACKER_AID = "BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP";
  static readonly FAILED_TO_CREATE_IDENTIFIER =
    "Failed to create new managed AID, operation not completing...";

  static readonly DEFAULT_ROLE = "agent";
  static readonly FAILED_TO_RESOLVE_OOBI =
    "Failed to resolve OOBI, operation not completing...";
  static readonly FAILED_TO_ISSUE_CREDENTIAL =
    "Failed to issue credential, operation not completing...";
  private signifyClient!: SignifyClient;
  private opTimeout: number;
  private opRetryInterval: number;

  constructor(opTimeout = 15000, opRetryInterval = 250) {
    this.opTimeout = opTimeout;
    this.opRetryInterval = opRetryInterval;
  }

  /**
   * Must be called first. (guard rails pending)
   */
  async start(): Promise<void> {
    await signifyReady();
    this.signifyClient = new SignifyClient(
      SignifyApi.LOCAL_KERIA_ENDPOINT,
      SignifyApi.SIGNIFY_BRAN,
      Tier.low,
      SignifyApi.LOCAL_KERIA_BOOT_ENDPOINT
    );
    try {
      await this.signifyClient.connect();
    } catch (err) {
      await this.signifyClient.boot();
      await this.signifyClient.connect();
    }
    await AriesAgent.agent.initKeri();
  }

  async createIdentifier(signifyName: string): Promise<any> {
    try {
      const op = await this.signifyClient
        .identifiers()
        .create(signifyName);
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
    } catch (error) {
      throw new Error(SignifyApi.FAILED_TO_CREATE_IDENTIFIER);
    }
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
    const alias = utils.uuid();
    let operation = await this.signifyClient.oobis().resolve(url, alias);
    operation = await this.waitAndGetDoneOp(
      operation,
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
    issuer: string,
    regk: string,
    schemaSAID: string,
    holder: string
  ) {
    const vcdata = {
      LEI: "5493001KJTIIGC8Y1R17",
    };
    try {
      const result = await this.signifyClient
        .credentials()
        .issue(issuer, regk, schemaSAID, holder, vcdata);
      await result.op();
      const acdc = new Serder(result.acdc);
      const iss = result.iserder;
      const ianc = result.anc;

      const sigers = result.sigs.map((sig: string) => new Siger({ qb64: sig }));
      const ims = d(messagize(ianc, sigers));

      const atc = ims.substring(result.anc.size);
      const dateTime = new Date().toISOString().replace("Z", "000+00:00");

      const [grant, gsigs, gend] = await this.signifyClient
        .ipex()
        .grant(
          issuer,
          holder,
          "",
          acdc,
          result.acdcSaider,
          iss,
          result.issExnSaider,
          result.anc,
          atc,
          undefined,
          dateTime
        );
      await this.signifyClient
        .exchanges()
        .sendFromEvents(issuer, "credential", grant, gsigs, gend, [holder]);
    } catch (error) {
      throw new Error(SignifyApi.FAILED_TO_ISSUE_CREDENTIAL);
    }
  }

  /**
   * Note - op must be of type any here until Signify cleans up its typing.
   */
  private async waitAndGetDoneOp(
    op: any,
    timeout: number,
    interval: number
  ): Promise<any> {
    const startTime = new Date().getTime();
    while (!op.done && new Date().getTime() < startTime + timeout) {
      op = await this.signifyClient.operations().get(op.name);
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    return op;
  }
}
