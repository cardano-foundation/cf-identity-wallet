import {
  InitConfig,
  Agent,
  AgentDependencies,
  RecordNotFoundError,
  DidsModule,
  KeyDidResolver,
  KeyType,
  TagValue,
} from "@aries-framework/core";
import { EventEmitter } from "events";
import { CapacitorFileSystem } from "./dependencies";
import {
  IonicStorageModule,
  GeneralStorageModule,
  MiscRecord,
  MiscRecordId,
} from "./modules";
import { HttpOutboundTransport } from "./transports";
import { LabelledKeyDidRegistrar } from "./dids";
import { IdentityType } from "./ariesAgent.types";

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
    this.agent.registerOutboundTransport(new HttpOutboundTransport());
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

  async createIdentity(type: IdentityType, displayName: string) {
    await this.agent.dids.create({
      method: type,
      displayName: displayName,
      options: { keyType: KeyType.Ed25519 },
    });
  }

  async getIdentities(method?: string, did?: string) {
    const dids = await this.agent.dids.getCreatedDids({method, did});

    let didRecordTags: { method: TagValue; displayName: TagValue; did: TagValue; createdAt: Date; }[] = [];

    dids.forEach(did => {
      didRecordTags.push(
        {
          method: did.getTag("method"),
          displayName: did.getTag("displayName"),
          did: did.getTag("did"),
          createdAt : did.createdAt,
        }
      )
    });

    return didRecordTags;
  }

  async getIdentity(did: string) {
    const didRecord = await this.agent.dids.getCreatedDids({did});

    if (didRecord.length === 1) {
      return didRecord[0];
    }
  }
}



export { AriesAgent, agentDependencies };
