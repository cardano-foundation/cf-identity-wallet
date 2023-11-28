import { utils } from "@aries-framework/core";
import {
  SignifyClient,
  ready as signifyReady,
  Tier,
  randomPasscode,
} from "signify-ts";
import {
  KeriContact,
  CreateIdentifierResult,
  IdentifierResult,
} from "./signifyApi.types";
import { KeyStoreKeys, SecureStorage } from "../../../storage";

export class SignifyApi {
  static readonly LOCAL_KERIA_ENDPOINT =
    "https://dev.keria.cf-keripy.metadata.dev.cf-deployments.org";
  static readonly LOCAL_KERIA_BOOT_ENDPOINT =
    "https://dev.keria-boot.cf-keripy.metadata.dev.cf-deployments.org";
  static readonly BACKER_AID = "BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP";
  static readonly FAILED_TO_CREATE_IDENTIFIER =
    "Failed to create new managed AID, operation not completing...";
  static readonly CREDENTIAL_NOT_FOUND =
    "Credential with given SAID not found on KERIA";

  // For now we connect to a single backer and hard-code the address - better solution should be provided in the future.
  static readonly BACKER_ADDRESS =
    "addr_test1vq0w66kmwwgkedxpcysfmy6z3lqxnyj7t4zzt5df3xv3qcs6cmmqm";

  static readonly BACKER_CONFIG = {
    toad: 1,
    wits: [SignifyApi.BACKER_AID],
    count: 1,
    ncount: 1,
    isith: "1",
    nsith: "1",
    data: [{ ca: SignifyApi.BACKER_ADDRESS }],
  };

  static readonly DEFAULT_ROLE = "agent";
  static readonly FAILED_TO_RESOLVE_OOBI =
    "Failed to resolve OOBI, operation not completing...";
  static readonly VLEI_HOST =
    "https://dev.vlei-server.cf-keripy.metadata.dev.cf-deployments.org/oobi/";
  static readonly SCHEMA_SAID = "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao";
  static resolvedOobi: { [key: string]: any } = {};

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
    const bran = await this.getBran();
    this.signifyClient = new SignifyClient(
      SignifyApi.LOCAL_KERIA_ENDPOINT,
      bran,
      Tier.low,
      SignifyApi.LOCAL_KERIA_BOOT_ENDPOINT
    );
    try {
      await this.signifyClient.connect();
    } catch (err) {
      await this.signifyClient.boot();
      await this.signifyClient.connect();
    }
  }

  async createIdentifier(): Promise<CreateIdentifierResult> {
    try {
      const signifyName = utils.uuid();
      const operation = await this.signifyClient
        .identifiers()
        .create(signifyName, SignifyApi.BACKER_CONFIG);
      await operation.op();
      await this.signifyClient
        .identifiers()
        .addEndRole(
          signifyName,
          SignifyApi.DEFAULT_ROLE,
          this.signifyClient.agent!.pre
        );
      return {
        signifyName,
        identifier: operation.serder.ked.i,
      };
    } catch {
      throw new Error(SignifyApi.FAILED_TO_CREATE_IDENTIFIER);
    }
  }

  async getIdentifierByName(name: string): Promise<any> {
    return this.signifyClient.identifiers().get(name);
  }

  async getOobi(name: string): Promise<string> {
    const result = await this.signifyClient
      .oobis()
      .get(name, SignifyApi.DEFAULT_ROLE);
    return result.oobis[0];
  }

  async getContacts(id?: string): Promise<KeriContact[]> {
    if (id) {
      return this.signifyClient.contacts().list(undefined, "id", id);
    }
    return this.signifyClient.contacts().list();
  }

  async resolveOobi(url: string): Promise<any> {
    if (SignifyApi.resolvedOobi[url]) {
      return SignifyApi.resolvedOobi[url];
    }
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
    const Oobi = { ...operation, alias };
    SignifyApi.resolvedOobi[url] = Oobi;
    return Oobi;
  }

  async getNotifications() {
    return this.signifyClient.notifications().list();
  }

  async markNotification(id: string) {
    return this.signifyClient.notifications().mark(id);
  }

  async admitIpex(
    notificationD: string,
    holderAidName: string,
    issuerAid: string
  ): Promise<void> {
    await this.resolveOobi(SignifyApi.VLEI_HOST + SignifyApi.SCHEMA_SAID);
    const dt = new Date().toISOString().replace("Z", "000+00:00");
    const [admit, sigs, aend] = await this.signifyClient
      .ipex()
      .admit(holderAidName, "", notificationD, dt);
    await this.signifyClient
      .ipex()
      .submitAdmit(holderAidName, admit, sigs, aend, [issuerAid]);
  }

  async getCredentials(): Promise<any> {
    return this.signifyClient.credentials().list();
  }

  async getCredentialBySaid(sad: string): Promise<any> {
    const results = await this.signifyClient.credentials().list({
      filter: {
        "-d": { $eq: sad },
      },
    });
    if (!results || !results.length) {
      throw new Error(SignifyApi.CREDENTIAL_NOT_FOUND);
    }
    return results[0];
  }

  async getKeriExchange(notificationD: string): Promise<any> {
    return this.signifyClient.exchanges().get(notificationD);
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

  private async getBran(): Promise<string> {
    let bran;
    try {
      bran = await SecureStorage.get(KeyStoreKeys.SIGNIFY_BRAN);
    } catch (error) {
      bran = randomPasscode();
      await SecureStorage.set(KeyStoreKeys.SIGNIFY_BRAN, bran);
    }
    return bran as string;
  }

  async getIdentifierById(id: string): Promise<IdentifierResult | undefined> {
    const allIdentifiers = await this.signifyClient.identifiers().list();
    const identifier = allIdentifiers.aids.find(
      (identifier: IdentifierResult) => identifier.prefix === id
    );
    return identifier;
  }
}
