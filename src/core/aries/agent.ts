import type { InitConfig } from '@aries-framework/core'
import { Agent } from '@aries-framework/core'
import { CapacitorFileSystem } from './capacitorFileSystem'
import EventEmitter from 'events'
import type { AgentDependencies } from '@aries-framework/core'

class ArisAgent {
  constructor() {

  }

  async start(): Promise<void> {
    const config: InitConfig = {
      label: 'docs-agent-nodejs',
      walletConfig: {
        id: 'wallet-id',
        key: 'testkey0000000000000000000000000',
      },
    }

    const agent = new Agent({
      config,
      dependencies: {
        FileSystem: CapacitorFileSystem,
        EventEmitterClass: EventEmitter,
        fetch: global.fetch as unknown as AgentDependencies['fetch'],
        WebSocketClass: global.WebSocket as unknown as AgentDependencies['WebSocketClass']
      },
    })

    try {
      await agent.initialize();
      console.log("Agent initialised!");
    } catch (e) {
      console.error(`Something went wrong while setting up the agent! Message: ${e}`);
    }
    console.log("WE ARE DONE");
  }
}

export { ArisAgent };