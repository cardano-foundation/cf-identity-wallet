import type { InboundTransport, Agent } from "@aries-framework/core";
import type { Express } from "express";
import type { Server } from "http";

import {
  DidCommMimeType,
  TransportService,
  utils,
  MessageReceiver,
} from "@aries-framework/core";
import express, { text } from "express";
import cors from "cors";
import { HttpTransportSession } from "@aries-framework/node/build/transport/HttpInboundTransport";

const supportedContentTypes: string[] = [
  DidCommMimeType.V0,
  DidCommMimeType.V1,
  "application/json",
];

export class HttpInboundTransport implements InboundTransport {
  public readonly app: Express;
  private port: number;
  private path: string;
  private _server?: Server;

  public get server() {
    return this._server;
  }

  public constructor({
    app,
    path,
    port,
  }: {
    app?: Express;
    path?: string;
    port: number;
  }) {
    this.port = port;

    // Create Express App
    this.app = app ?? express();
    this.path = path ?? "/";

    this.app.use(text({ type: supportedContentTypes, limit: "5mb" }));
    this.app.use(cors());
  }

  public async start(agent: Agent) {
    const transportService = agent.dependencyManager.resolve(TransportService);
    const messageReceiver = agent.dependencyManager.resolve(MessageReceiver);

    agent.config.logger.debug(`Starting HTTP inbound transport`, {
      port: this.port,
    });

    this.app.post(this.path, async (req, res) => {
      const contentType = req.headers["content-type"];
      if (!contentType || !supportedContentTypes.includes(contentType)) {
        return res
          .status(415)
          .send(
            "Unsupported content-type. Supported content-types are: " +
              supportedContentTypes.join(", ")
          );
      }

      const session = new HttpTransportSession(utils.uuid(), req, res);
      try {
        const message = req.body;
        const encryptedMessage = JSON.parse(message);
        await messageReceiver.receiveMessage(encryptedMessage, {
          session,
        });

        // If agent did not use session when processing message we need to send response here.
        if (!res.headersSent) {
          res.status(200).end();
        }
      } catch (error) {
        agent.config.logger.error(`Error processing inbound message: ${error}`);

        if (!res.headersSent) {
          res.status(500).send("Error processing message");
        }
      } finally {
        transportService.removeSession(session);
      }
      return;
    });

    this._server = this.app.listen(this.port);
  }

  public async stop(): Promise<void> {
    this._server?.close();
  }
}
