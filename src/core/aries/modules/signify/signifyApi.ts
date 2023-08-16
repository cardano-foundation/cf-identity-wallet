import { injectable, utils } from "@aries-framework/core";
import { SignifyClient, ready as signifyReady, Tier } from "signify-ts";

@injectable()
export class SignifyApi {
  static readonly LOCAL_KERIA_ENDPOINT = "http://127.0.0.1:3901";
  static readonly LOCAL_KERIA_BOOT_ENDPOINT = "http://127.0.0.1:3903";
  static readonly SIGNIFY_BRAN = "0123456789abcdefghijk";  // @TODO - foconnor: Shouldn't be hard-coded.
  static readonly BACKER_AID = "BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP";
  static readonly FAILED_TO_CREATE_IDENTIFIER = "Failed to create new managed AID, operation not completing...";
  static readonly BACKER_CONFIG = {
    toad: 1,
    wits: [SignifyApi.BACKER_AID],
    count: 1,
    ncount: 1,
    isith: "1",
    nsith: "1",
    data: [{ ca: "addr_test1vq0w66kmwwgkedxpcysfmy6z3lqxnyj7t4zzt5df3xv3qcs6cmmqm" }]
  };

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
  }

  async createIdentifier(): Promise<string> {
    const op = await this.signifyClient.identifiers().create(utils.uuid(), SignifyApi.BACKER_CONFIG);
    if (!(await this.waitUntilOpDone(op, this.opTimeout, this.opRetryInterval))) {
      throw new Error(SignifyApi.FAILED_TO_CREATE_IDENTIFIER);
    }
    return op.name.replace("witness.", "");
  }

  async getIdentifiersDetailed(): Promise<any[]> {
    // @TODO - foconnor: We shouldn't need to individually re-pull every identifier
    // but we don't have the records in place in Aries yet, so this is just to get created at date (even though after a rotation it will be wrong).
    return (await Promise.all((await this.signifyClient.identifiers().list()).map(async (aid: any) => {
      return this.signifyClient.identifiers().get(aid.name);
    }))).flat();
  }

  /**
   * Note - op must be of type any here until Signify cleans up its typing.
   */
  private async waitUntilOpDone(op: any, timeout: number, interval: number): Promise<boolean> {
    const startTime = new Date().getTime();
    while (!op.done && new Date().getTime() < startTime + timeout) {
      op = await this.signifyClient.operations().get(op.name);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    return op.done;
  }
}
