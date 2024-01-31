import { utils } from "@aries-framework/core";
import {
  SignifyClient,
  ready as signifyReady,
  Tier,
  randomPasscode,
  Algos,
  Siger,
  d,
  messagize,
  Serder,
  EventResult,
  Operation,
} from "signify-ts";
import {
  KeriContact,
  CreateIdentifierResult,
  IdentifierResult,
  IdentifiersListResult,
  CreateMultisigExnPayload,
  Aid,
  MultiSigIcpNotification,
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
  static readonly FAILED_TO_CREATE_DELEGATION_IDENTIFIER =
    "Failed to create new delegation AID";

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
  }

  async createDelegationIdentifier(
    delegatorPrefix: string
  ): Promise<CreateIdentifierResult> {
    try {
      const signifyName = utils.uuid();
      const operation = await this.signifyClient
        .identifiers()
        .create(signifyName, { delpre: delegatorPrefix });
      await operation.op();
      return { signifyName, identifier: operation.serder.ked.i };
    } catch (err) {
      throw new Error(SignifyApi.FAILED_TO_CREATE_DELEGATION_IDENTIFIER);
    }
  }

  async interactDelegation(signifyName: string, delegatePrefix: string) {
    const anchor = {
      i: delegatePrefix,
      s: "0",
      d: delegatePrefix,
    };
    return this.signifyClient.identifiers().interact(signifyName, anchor);
  }

  async delegationApproved(signifyName: string): Promise<boolean> {
    const identifier = await this.signifyClient.identifiers().get(signifyName);
    const operation = await this.signifyClient
      .keyStates()
      .query(identifier.state.di, "1");
    await this.waitAndGetDoneOp(
      operation,
      this.opTimeout,
      this.opRetryInterval
    );
    return operation.done;
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

  async getContactById(id: string): Promise<KeriContact> {
    return this.signifyClient.contacts().get(id);
  }

  async deleteContactById(id: string): Promise<KeriContact> {
    return this.signifyClient.contacts().delete(id);
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

  async getCredentialBySaid(
    sad: string
  ): Promise<{ acdc?: any; error?: unknown }> {
    try {
      const results = await this.signifyClient.credentials().list({
        filter: {
          "-d": { $eq: sad },
        },
      });
      return {
        acdc: results[0],
      };
    } catch (error) {
      return {
        error,
      };
    }
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
  ): Promise<Operation> {
    const startTime = new Date().getTime();
    while (!op.done && new Date().getTime() < startTime + timeout) {
      op = await this.signifyClient.operations().get(op.name);
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    return op;
  }

  async getOpByName(name: string): Promise<Operation> {
    return this.signifyClient.operations().get(name);
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
    const allIdentifiers = await this.getAllIdentifiers();
    const identifier = allIdentifiers.aids.find(
      (identifier: IdentifierResult) => identifier.prefix === id
    );
    return identifier;
  }

  async getAllIdentifiers(): Promise<IdentifiersListResult> {
    const allIdentifiersResult = await this.signifyClient.identifiers().list();
    return allIdentifiersResult;
  }

  async createMultisig(
    aid: Aid,
    otherAids: Pick<Aid, "state">[],
    name: string
  ): Promise<{
    op: any;
    icpResult: EventResult;
    name: string;
  }> {
    const states = [aid["state"], ...otherAids.map((aid) => aid["state"])];
    const icp = await this.signifyClient.identifiers().create(name, {
      algo: Algos.group,
      mhab: aid,
      isith: otherAids.length + 1,
      nsith: otherAids.length + 1,
      toad: aid.state.b.length,
      wits: aid.state.b,
      states: states,
      rstates: states,
    });
    const op = await icp.op();
    const serder = icp.serder;

    const sigs = icp.sigs;
    const sigers = sigs.map((sig: string) => new Siger({ qb64: sig }));

    const ims = d(messagize(serder, sigers));
    const atc = ims.substring(serder.size);
    const embeds = {
      icp: [serder, atc],
    };

    const smids = states.map((state) => state["i"]);
    const recp = otherAids
      .map((aid) => aid["state"])
      .map((state) => state["i"]);
    await this.sendMultisigExn(aid["name"], aid, embeds, recp, {
      gid: serder.pre,
      smids: smids,
      rmids: smids,
      rstates: states,
      name,
    });
    return {
      op: op,
      icpResult: icp,
      name: name,
    };
  }

  private async sendMultisigExn(
    name: string,
    aid: Aid,
    embeds: {
      icp: (string | Serder)[];
    },
    recp: any,
    payload: CreateMultisigExnPayload
  ): Promise<any> {
    return this.signifyClient
      .exchanges()
      .send(name, "multisig", aid, "/multisig/icp", payload, embeds, recp);
  }

  async getNotificationsBySaid(
    said: string
  ): Promise<MultiSigIcpNotification[]> {
    return this.signifyClient.groups().getRequest(said);
  }

  async joinMultisig(
    exn: MultiSigIcpNotification["exn"],
    aid: Aid,
    name: string
  ): Promise<{
    op: any;
    icpResult: EventResult;
    name: string;
  }> {
    const icp = exn.e.icp;
    const rstates = exn.a.rstates;
    const icpResult = await this.signifyClient.identifiers().create(name, {
      algo: Algos.group,
      mhab: aid,
      isith: icp.kt,
      nsith: icp.nt,
      toad: parseInt(icp.bt),
      wits: icp.b,
      states: exn.a.rstates,
      rstates: exn.a.rstates,
    });
    const op = await icpResult.op();
    const serder = icpResult.serder;
    const sigs = icpResult.sigs;
    const sigers = sigs.map((sig: string) => new Siger({ qb64: sig }));

    const ims = d(messagize(serder, sigers));
    const atc = ims.substring(serder.size);
    const embeds = {
      icp: [serder, atc],
    };

    const smids = exn.a.smids;
    const recp = rstates
      .filter((r) => r.i !== aid.state.i)
      .map((state) => state["i"]);
    await this.sendMultisigExn(aid["name"], aid, embeds, recp, {
      gid: serder.pre,
      smids: smids,
      rmids: smids,
      rstates,
      name,
    });
    return {
      op: op,
      icpResult: icpResult,
      name: name,
    };
  }
}
