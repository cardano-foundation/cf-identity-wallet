import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { config } from "./config";
import { AriesAgent } from "./agent";
import router from "./routes";
import { log } from "./log";
async function startServer() {
  const app = express();
  app.use("/static", express.static("static"));
  app.use(cors());
  app.use(bodyParser.json());
  app.use(router);
  await AriesAgent.agent.start();
  log(`Listening on port ${config.port}`);
}

void startServer();
