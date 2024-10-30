import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { config } from "./config";
import { Agent } from "./agent";
import router from "./routes";
import { log } from "./log";
import { ACDC_SCHEMAS } from "./utils/schemas";

async function initializeDatabase() {
  await Agent.agent.saidifySchema(ACDC_SCHEMAS["EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao"], "$id");
  await Agent.agent.saidifySchema(ACDC_SCHEMAS["EJxnJdxkHbRw2wVFNe4IUOPLt8fEtg9Sr3WyTjlgKoIb"], "$id");
  await Agent.agent.saidifySchema(ACDC_SCHEMAS["ENPXp1vQzRF6JwIuS-mp2U8Uf1MoADoP_GqQ62VsDZWY"], "$id");
}

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
  await initializeDatabase();
  app.listen(config.port, async () => {
    await Agent.agent.initKeri();
    log(`Listening on port ${config.port}`);
  });
}

void startServer();
