import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { config } from "./config";
import { Agent } from "./agent";
import router from "./routes";
import { log } from "./log";

async function startServer() {
  const app = express();
  app.use("/static", express.static("static"));
  app.use(cors());
  app.use(bodyParser.json());
  app.use(router);
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: err.message,
    });
  });
  await Agent.agent.start();
  app.listen(config.port, async () => {
    await Agent.agent.initKeri();
    log(`Listening on port ${config.port}`);
  });
}

void startServer();
