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
  CreateIdentiferArgs,
} from "signify-ts";
import { ConfigurationService } from "../../../configuration/configurationService";
import {
  KeriContact,
  CreateIdentifierResult,
  IdentifierResult,
  IdentifiersListResult,
  CreateMultisigExnPayload,
  Aid,
  MultiSigExnMessage,
  MultiSigRoute,
} from "./signifyApi.types";
import { KeyStoreKeys, SecureStorage } from "../../../storage";
import { WitnessMode } from "../../../configuration/configurationService.types";

export class SignifyApi {
  static readonly LOCAL_KERIA_ENDPOINT =
    "https://dev.keria.cf-keripy.metadata.dev.cf-deployments.org";
  static readonly LOCAL_KERIA_BOOT_ENDPOINT =
    "https://dev.keria-boot.cf-keripy.metadata.dev.cf-deployments.org";

  static readonly DEFAULT_ROLE = "agent";
  static readonly FAILED_TO_RESOLVE_OOBI =
    "Failed to resolve OOBI, operation not completing...";
  static readonly FAILED_TO_ROTATE_AID =
    "Failed to rotate AID, operation not completing...";
  static readonly INVALID_THRESHOLD = "Invalid threshold";
  static readonly CANNOT_GET_KEYSTATES_FOR_MULTISIG_MEMBER =
    "Unable to retrieve key states for given multi-sig member";

  static readonly CREDENTIAL_SERVER =
    "https://dev.credentials.cf-keripy.metadata.dev.cf-deployments.org/oobi/";
  static readonly SCHEMA_SAID_VLEI =
    "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao";
  static readonly SCHEMA_SAID_IIW_DEMO =
    "EKYv475K1k6uMt9IJw99NM8iLQuQf1bKfSHqA1XIKoQy";
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
    // @TODO - foconnor: Review of Tier level.
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
      .create(signifyName); //, this.getCreateAidOptions());
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
    const signifyName = utils.uuid();
    const operation = await this.signifyClient
      .identifiers()
      .create(signifyName, { delpre: delegatorPrefix });
    return { signifyName, identifier: operation.serder.ked.i };
  }

  async interactDelegation(
    signifyName: string,
    delegatePrefix: string
  ): Promise<boolean> {
    const anchor = {
      i: delegatePrefix,
      s: "0",
      d: delegatePrefix,
    };
    const ixnResult = await this.signifyClient
      .identifiers()
      .interact(signifyName, anchor);
    const operation = await ixnResult.op();
    await this.waitAndGetDoneOp(
      operation,
      this.opTimeout,
      this.opRetryInterval
    );
    return operation.done;
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

  async queryKeyState(prefix: string, sequence: string) {
    return this.signifyClient.keyStates().query(prefix, sequence);
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

  async getNotifications(start = 0, end = 24) {
    return this.signifyClient.notifications().list(start, end);
  }

  async markNotification(id: string) {
    return this.signifyClient.notifications().mark(id);
  }

  async admitIpex(
    notificationD: string,
    holderAidName: string,
    issuerAid: string
  ): Promise<void> {
    // @TODO - foconnor: For now this will only work with our test server, we need to find a better way to handle this in production.
    await this.resolveOobi(
      SignifyApi.CREDENTIAL_SERVER + SignifyApi.SCHEMA_SAID_VLEI
    );
    await this.resolveOobi(
      SignifyApi.CREDENTIAL_SERVER + SignifyApi.SCHEMA_SAID_IIW_DEMO
    );
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
    name: string,
    threshold: number,
    delegate?: Aid
  ): Promise<{
    op: any;
    icpResult: EventResult;
    name: string;
  }> {
    if (threshold < 1 || threshold > otherAids.length + 1) {
      throw new Error(SignifyApi.INVALID_THRESHOLD);
    }
    const states = [aid["state"], ...otherAids.map((aid) => aid["state"])];
    const icp = await this.signifyClient.identifiers().create(name, {
      algo: Algos.group,
      mhab: aid,
      isith: threshold,
      nsith: threshold,
      toad: aid.state.b.length,
      wits: aid.state.b,
      states: states,
      rstates: states,
      delpre: delegate?.prefix,
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
    await this.sendMultisigExn(
      aid["name"],
      aid,
      MultiSigRoute.ICP,
      embeds,
      recp,
      {
        gid: serder.pre,
        smids: smids,
        rmids: smids,
        rstates: states,
        name,
      }
    );
    return {
      op: op,
      icpResult: icp,
      name: name,
    };
  }

  async rotateMultisigAid(
    aid: Aid,
    multisigAidMembers: Pick<Aid, "state">[],
    name: string
  ): Promise<{
    op: any;
    icpResult: EventResult;
  }> {
    const states = [...multisigAidMembers.map((aid) => aid["state"])];
    const icp = await this.signifyClient
      .identifiers()
      .rotate(name, { states: states, rstates: states });
    const op = await icp.op();
    const serder = icp.serder;

    const sigs = icp.sigs;
    const sigers = sigs.map((sig: string) => new Siger({ qb64: sig }));

    const ims = d(messagize(serder, sigers));
    const atc = ims.substring(serder.size);
    const embeds = {
      rot: [serder, atc],
    };

    const smids = states.map((state) => state["i"]);
    const recp = multisigAidMembers
      .map((aid) => aid["state"])
      .map((state) => state["i"]);

    await this.sendMultisigExn(
      aid["name"],
      aid,
      MultiSigRoute.ROT,
      embeds,
      recp,
      {
        gid: serder.pre,
        smids: smids,
        rmids: smids,
        rstates: states,
        name,
      }
    );
    return {
      op: op,
      icpResult: icp,
    };
  }

  async joinMultisigRotation(
    exn: MultiSigExnMessage["exn"],
    aid: Aid,
    name: string
  ): Promise<{
    op: any;
    icpResult: EventResult;
    name: string;
  }> {
    const rstates = exn.a.rstates;
    const icpResult = await this.signifyClient
      .identifiers()
      .rotate(name, { states: rstates, rstates: rstates });
    const op = await icpResult.op();
    const serder = icpResult.serder;
    const sigs = icpResult.sigs;
    const sigers = sigs.map((sig: string) => new Siger({ qb64: sig }));

    const ims = d(messagize(serder, sigers));
    const atc = ims.substring(serder.size);
    const embeds = {
      rot: [serder, atc],
    };

    const smids = exn.a.smids;
    const recp = rstates
      .filter((r) => r.i !== aid.state.i)
      .map((state) => state["i"]);
    await this.sendMultisigExn(
      aid["name"],
      aid,
      MultiSigRoute.IXN,
      embeds,
      recp,
      {
        gid: serder.pre,
        smids: smids,
        rmids: smids,
        rstates,
        name,
      }
    );
    return {
      op: op,
      icpResult: icpResult,
      name: name,
    };
  }

  private async sendMultisigExn(
    name: string,
    aid: Aid,
    route: MultiSigRoute,
    embeds: {
      icp?: (string | Serder)[];
      rot?: (string | Serder)[];
    },
    recp: any,
    payload: CreateMultisigExnPayload
  ): Promise<any> {
    return this.signifyClient
      .exchanges()
      .send(name, "multisig", aid, route, payload, embeds, recp);
  }

  async getMultisigMessageBySaid(said: string): Promise<MultiSigExnMessage[]> {
    return this.signifyClient.groups().getRequest(said);
  }

  async joinMultisig(
    exn: MultiSigExnMessage["exn"],
    aid: Aid,
    name: string
  ): Promise<{
    op: any;
    icpResult: EventResult;
    name: string;
  }> {
    const icp = exn.e.icp;

    // @TODO - foconnor: We can skip our member and get state from aid param.
    const states = await Promise.all(
      exn.a.smids.map(async (member) => {
        const result = await this.signifyClient.keyStates().get(member);
        if (result.length === 0) {
          throw new Error(SignifyApi.CANNOT_GET_KEYSTATES_FOR_MULTISIG_MEMBER);
        }
        return result[0];
      })
    );

    // @TODO - foconnor: Check if smids === rmids, and if so, skip this.
    const rstates = await Promise.all(
      exn.a.rmids.map(async (member) => {
        const result = await this.signifyClient.keyStates().get(member);
        if (result.length === 0) {
          throw new Error(SignifyApi.CANNOT_GET_KEYSTATES_FOR_MULTISIG_MEMBER);
        }
        return result[0];
      })
    );
    const icpResult = await this.signifyClient.identifiers().create(name, {
      algo: Algos.group,
      mhab: aid,
      isith: icp.kt,
      nsith: icp.nt,
      toad: parseInt(icp.bt),
      wits: icp.b,
      states,
      rstates,
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
    const recp = states
      .filter((r) => r.i !== aid.state.i)
      .map((state) => state["i"]);
    await this.sendMultisigExn(
      aid["name"],
      aid,
      MultiSigRoute.ICP,
      embeds,
      recp,
      {
        gid: serder.pre,
        smids: smids,
        rmids: smids,
        rstates,
        name,
      }
    );
    return {
      op: op,
      icpResult: icpResult,
      name: name,
    };
  }

  async rotateIdentifier(signifyName: string): Promise<void> {
    const rotateResult = await this.signifyClient
      .identifiers()
      .rotate(signifyName);
    let operation = await rotateResult.op();
    operation = await this.waitAndGetDoneOp(
      operation,
      this.opTimeout,
      this.opRetryInterval
    );
    if (!operation.done) {
      throw new Error(SignifyApi.FAILED_TO_ROTATE_AID);
    }
  }

  async getMultisigMembers(name: string): Promise<any> {
    return this.signifyClient.identifiers().members(name);
  }
  private getCreateAidOptions(): CreateIdentiferArgs {
    if (ConfigurationService.env.keri.backerType === WitnessMode.LEDGER) {
      return {
        toad: 1,
        wits: [ConfigurationService.env.keri.ledger.aid],
        count: 1,
        ncount: 1,
        isith: "1",
        nsith: "1",
        data: [{ ca: ConfigurationService.env.keri.ledger.address }],
      };
    }
    return {
      toad: ConfigurationService.env.keri.pools.length,
      wits: ConfigurationService.env.keri.pools,
    };
  }
}
