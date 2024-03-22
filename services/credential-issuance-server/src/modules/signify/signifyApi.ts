import { utils } from "@aries-framework/core";
import {
  SignifyClient,
  ready as signifyReady,
  Tier,
  randomPasscode,
  Operation,
} from "signify-ts";
import { AriesAgent } from "../../ariesAgent";
import { waitAndGetDoneOp } from "./utils";
import { config } from "../../config";

export class SignifyApi {
  static readonly LOCAL_KERIA_ENDPOINT = "http://127.0.0.1:3901";
  static readonly LOCAL_KERIA_BOOT_ENDPOINT = "http://127.0.0.1:3903";
  static readonly DEFAULT_ROLE = "agent";
  static readonly FAILED_TO_RESOLVE_OOBI =
    "Failed to resolve OOBI, operation not completing...";
  static readonly UNKNOW_SCHEMA_ID = "Unknow Schema ID: "
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
      randomPasscode(), // Different on every restart but this is OK for our purposes.
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
    const alias = utils.uuid();
    let operation = await this.signifyClient.oobis().resolve(url, alias);
    operation = await waitAndGetDoneOp(
      this.signifyClient,
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
    issuerName: string,
    registryId: string,
    schemaId: string,
    recipient: string,
    name?: string
  ) {
    await this.resolveOobi(`${config.endpoint}/oobi/${schemaId}`);
    
    let vcdata = {}
    if (schemaId === "EKYv475K1k6uMt9IJw99NM8iLQuQf1bKfSHqA1XIKoQy") {
      vcdata = {
        attendeeName: name,
      };
    } else if (schemaId === "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao") {
      vcdata = {
        LEI: "5493001KJTIIGC8Y1R17",
      };
    } else {
      throw new Error(SignifyApi.UNKNOW_SCHEMA_ID + schemaId);
    }
    
    const result = await this.signifyClient
      .credentials()
      .issue({ issuerName, registryId, schemaId, recipient, data: vcdata });
    await waitAndGetDoneOp(this.signifyClient, result.op, this.opTimeout, this.opRetryInterval);
    
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

  async requestDisclosure(senderName: string, schemaSaid: string, recipient: string) {
    /*const [apply, sigs] = await this.signifyClient.ipex().apply({
      senderName,
      recipient,
      schema: schemaSaid,
    });
    await this.signifyClient
      .ipex()
      .submitApply(senderName, apply, sigs, [recipient]);*/
  }

  async contacts(): Promise<any> {
    return this.signifyClient.contacts().list();
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
