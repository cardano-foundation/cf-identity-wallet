import { SignifyClient, ready as signifyReady, Tier } from "signify-ts";

export class SignifyApi {
  static readonly LOCAL_KERIA_ENDPOINT =
    "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3901";
  static readonly LOCAL_KERIA_BOOT_ENDPOINT =
    "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3903";
  static readonly SIGNIFY_BRAN = "0123456789abcdefghijk"; // @TODO - foconnor: Shouldn't be hard-coded.
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

  async createIdentifier(signifyName: string): Promise<any> {
    const op = await this.signifyClient
      .identifiers()
      .create(signifyName, SignifyApi.BACKER_CONFIG);
    if (
      !(await this.waitUntilOpDone(op, this.opTimeout, this.opRetryInterval))
    ) {
      throw new Error(SignifyApi.FAILED_TO_CREATE_IDENTIFIER);
    }
    const aid1 = await this.getIdentifierByName(signifyName);
    return aid1;
  }

  async getIdentifierByName(name: string): Promise<any> {
    return this.signifyClient.identifiers().get(name);
  }

  async createOobi(signifyName: string): Promise<any> {
    const result = await this.signifyClient.oobis().get(signifyName);
    return result.oobis[0];
  }
  /**
   * Note - op must be of type any here until Signify cleans up its typing.
   */
  private async waitUntilOpDone(
    op: any,
    timeout: number,
    interval: number
  ): Promise<boolean> {
    const startTime = new Date().getTime();
    while (!op.done && new Date().getTime() < startTime + timeout) {
      op = await this.signifyClient.operations().get(op.name);
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    return op.done;
  }
}
