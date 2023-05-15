import { AriesAgent } from "./ariesAgent";

async function runWorker() {
  const agent = new AriesAgent();
  await agent.start();
}

runWorker();
