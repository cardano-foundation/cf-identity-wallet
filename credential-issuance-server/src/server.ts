import express from "express";
import { HttpInboundTransport } from "@aries-framework/node";
import cors from "cors";
import { config } from "./config";
import { AriesAgent } from "./ariesAgent";
import router from "./routes";
import { log } from "./log";

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(router);
  const httpServer = new HttpInboundTransport({ app, port: config.port });
  const agent = AriesAgent.agent;
  await agent.start(httpServer);
  log(`Listening on port ${config.port}`);
}

void startServer();
