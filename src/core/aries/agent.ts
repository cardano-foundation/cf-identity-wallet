import type { InitConfig } from '@aries-framework/core'
import { Agent } from '@aries-framework/core'
import { agentDependencies } from '@aries-framework/node'
/*import { HttpOutboundTransport, WsOutboundTransport } from '@aries-framework/core'
import { HttpInboundTransport } from '@aries-framework/node'
import { AskarModule } from '@aries-framework/askar'
import { ariesAskar } from '@hyperledger/aries-askar-nodejs'*/

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
            dependencies: agentDependencies,
            /*modules: {
              // Register the Askar module on the agent
              askar: new AskarModule({
                ariesAskar,
              }),
            },*/
          })

          /*agent.registerOutboundTransport(new HttpOutboundTransport())
          agent.registerOutboundTransport(new WsOutboundTransport())
          agent.registerInboundTransport(new HttpInboundTransport({ port: 3000 }))*/

          agent
          .initialize()
          .then(() => {
            console.log('Agent initialized!')
          })
          .catch((e) => {
            console.error(`Something went wrong while setting up the agent! Message: ${e}`)
          })
    }
}

export { ArisAgent };