import {
  InitConfig,
  Agent,
  AgentDependencies,
  RecordNotFoundError,
  DidsModule,
  KeyDidResolver,
  KeyType,
} from "@aries-framework/core";
import { EventEmitter } from "events";
import { CapacitorFileSystem } from "./dependencies/capacitorFileSystem";
import {
  IonicStorageModule,
  GeneralStorageModule,
  MiscRecord,
  MiscRecordId,
  CryptoAccountRecord,
} from "./modules";
import { LabelledKeyDidRegistrar } from "./dids";
import { IdentityType } from "./ariesAgent.types";
import { Bip32PrivateKey } from "@emurgo/cardano-serialization-lib-browser";

const config: InitConfig = {
  label: "idw-agent",
  walletConfig: {
    id: "idw",
    key: "idw", // Right now, this key isn't used as we don't have encryption.
  },
  autoUpdateStorageOnStartup: true,
};

const agentDependencies: AgentDependencies = {
  FileSystem: CapacitorFileSystem,
  EventEmitterClass: EventEmitter,
  fetch: global.fetch as unknown as AgentDependencies["fetch"],
  WebSocketClass:
    global.WebSocket as unknown as AgentDependencies["WebSocketClass"],
};

class AriesAgent {
  private static instance: AriesAgent;
  private readonly agent: Agent;

  private constructor() {
    this.agent = new Agent({
      config,
      dependencies: agentDependencies,
      modules: {
        ionicStorage: new IonicStorageModule(),
        generalStorage: new GeneralStorageModule(),
        dids: new DidsModule({
          registrars: [new LabelledKeyDidRegistrar()],
          resolvers: [new KeyDidResolver()],
        }),
      },
    });
  }

  static get agent() {
    if (!this.instance) {
      this.instance = new AriesAgent();
    }
    return this.instance;
  }

  async start(): Promise<void> {
    await this.agent.initialize();
  }

  async storeMiscRecord(id: MiscRecordId, value: string) {
    await this.agent.modules.generalStorage.saveMiscRecord(
      new MiscRecord({ id, value })
    );
  }

  async getMiscRecordValueById(id: MiscRecordId): Promise<string | undefined> {
    try {
      return (await this.agent.modules.generalStorage.getMiscRecordById(id))
        .value;
    } catch (e) {
      if (e instanceof RecordNotFoundError) {
        return undefined;
      }
      throw e;
    }
  }

  async storeCryptoAccountRecord(rootExtendedPrivateKey: string) {
    const rootKey = Bip32PrivateKey.from_hex(rootExtendedPrivateKey);
    const rootExtendedPublicKey = rootKey.to_public().to_hex();

    const accountKey = rootKey
      .derive(harden(1852))
      .derive(harden(1815))
      .derive(harden(0));

    const utxoPubKey = accountKey.derive(0).derive(0).to_public().to_hex();

    const stakeKey = accountKey.derive(2).derive(0).to_public().to_hex();

    await this.agent.modules.generalStorage.saveCryptoRecord(
      new CryptoAccountRecord({
        id: rootExtendedPublicKey,
        address: utxoPubKey,
        stakeKey,
      })
    );
  }

  async getAllCryptoAccountRecords(): Promise<CryptoAccountRecord[]> {
    return await this.agent.modules.generalStorage.getAllCryptoAccountRecords();
  }

  async getCryptoAccountRecordValueById(
    rootExtendedPublicKey: string
  ): Promise<string | undefined> {
    try {
      return (
        await this.agent.modules.generalStorage.getCryptoAccountRecordById(
          rootExtendedPublicKey
        )
      ).value;
    } catch (e) {
      if (e instanceof RecordNotFoundError) {
        return undefined;
      }
      throw e;
    }
  }

  async createIdentity(type: IdentityType, displayName: string) {
    await this.agent.dids.create({
      method: type,
      displayName: displayName,
      options: { keyType: KeyType.Ed25519 },
    });
  }
}

function harden(num: number): number {
  return 0x80000000 + num;
}

export { AriesAgent, agentDependencies };
