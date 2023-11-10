import { utils } from "@aries-framework/core";
import { SignifyClient, ready as signifyReady, Tier } from "signify-ts";
import { IContact, ICreateIdentifierResult } from "./signifyApi.types";
import { KeyStoreKeys, SecureStorage } from "../../../storage";

export class SignifyApi {
  static readonly LOCAL_KERIA_ENDPOINT =
    "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3901";
  static readonly LOCAL_KERIA_BOOT_ENDPOINT =
    "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3903";
  static readonly BACKER_AID = "BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP";
  static readonly FAILED_TO_CREATE_IDENTIFIER =
    "Failed to create new managed AID, operation not completing...";

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
  static readonly ISSUER_AID_NAME = "issuer";
  static readonly DEFAULT_ROLE = "agent";
  static readonly FAILED_TO_RESOLVE_OOBI =
    "Failed to resolve OOBI, operation not completing...";

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

  async createIdentifier(): Promise<ICreateIdentifierResult> {
    const signifyName = utils.uuid();
    let operation = await this.signifyClient
      .identifiers()
      .create(signifyName, SignifyApi.BACKER_CONFIG);
    operation = await this.waitAndGetOp(
      operation,
      this.opTimeout,
      this.opRetryInterval
    );
    if (!operation.done) {
      throw new Error(SignifyApi.FAILED_TO_CREATE_IDENTIFIER);
    }
    await this.signifyClient
      .identifiers()
      .addEndRole(
        signifyName,
        SignifyApi.DEFAULT_ROLE,
        this.signifyClient.agent!.pre
      );
    return {
      signifyName,
      identifier: operation.name.replace("witness.", ""),
    };
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

  async getContacts(id?: string): Promise<IContact[]> {
    if (id) {
      return this.signifyClient.contacts().list(undefined, "id", id);
    }
    return this.signifyClient.contacts().list();
  }

  async resolveOobi(url: string): Promise<any> {
    let operation = await this.signifyClient
      .oobis()
      .resolve(url, SignifyApi.ISSUER_AID_NAME);
    operation = await this.waitAndGetOp(
      operation,
      this.opTimeout,
      this.opRetryInterval
    );
    if (!operation.done) {
      throw new Error(SignifyApi.FAILED_TO_RESOLVE_OOBI);
    }
    return operation;
  }

  /**
   * Note - op must be of type any here until Signify cleans up its typing.
   */
  private async waitAndGetOp(
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
      bran = this.generateRandomKey();
      await SecureStorage.set(KeyStoreKeys.SIGNIFY_BRAN, bran);
    }
    return bran as string;
  }

  private generateRandomKey() {
    const characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const length = 21;
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }
}
