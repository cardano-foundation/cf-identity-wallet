import express from "express";
import {HttpInboundTransport} from "@aries-framework/node";
import cors from "cors";
import {config} from "./config";
import {AriesAgent} from "./ariesAgent";
import router from "./routes";
import { log } from "./log";
async function startServer() {
  const app = express();
  app.use(cors())
  const httpServer = new HttpInboundTransport({ app, port: config.port });
  const agent = AriesAgent.agent;
  await agent.start(httpServer);
  httpServer.app.use(router)
  log(`Listening on port ${config.port}`)
}

startServer().then(() => log("Server started"))
  .catch((err) => {
    throw err;
  })