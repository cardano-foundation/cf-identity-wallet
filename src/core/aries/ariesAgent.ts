import { InitConfig, Agent, AgentDependencies } from "@aries-framework/core";
import { EventEmitter } from "events";
import { CapacitorFileSystem } from "./dependencies/capacitorFileSystem";
import { IonicStorageModule } from "./modules/ionicstorage";

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
  agent: Agent;

  constructor() {
    this.agent = new Agent({
      config,
      dependencies: agentDependencies,
      modules: {
        ionicStorage: new IonicStorageModule(),
      },
    });
  }

  async start(): Promise<void> {
    await this.agent.initialize();
  }
}

export { AriesAgent, agentDependencies };
