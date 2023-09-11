import express from "express";
import { HttpInboundTransport } from "@aries-framework/node";
import cors from "cors";
import { config } from "./config";
import { AriesAgent } from "./ariesAgent";
import router from "./routes";
import { log } from "./log";
async function startServer() {
  const app = express();
  const httpServer = new HttpInboundTransport({ app, port: config.port });
  const agent = AriesAgent.agent;
  await agent.start(httpServer);
  httpServer.app.use(router);
  httpServer.app.use(cors());
  log(`Listening on port ${config.port}`);
}

export { startServer };
