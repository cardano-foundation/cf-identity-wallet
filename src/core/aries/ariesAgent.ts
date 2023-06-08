import { InitConfig, Agent, AgentDependencies, RecordNotFoundError } from "@aries-framework/core";
import { EventEmitter } from "events";
import { CapacitorFileSystem } from "./dependencies/capacitorFileSystem";
import {
  IonicStorageModule,
  GeneralStorageModule,
  MiscRecord,
  MiscRecordId,
} from "./modules";

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

  async getMiscRecordValueById(id: MiscRecordId): Promise<string|undefined> {
    try {
      return (await this.agent.modules.generalStorage.getMiscRecordById(id))
      .value;
    } catch(e) {
      if (e instanceof RecordNotFoundError) {
        return undefined;
      }
    }
  }
}

export { AriesAgent, agentDependencies };
