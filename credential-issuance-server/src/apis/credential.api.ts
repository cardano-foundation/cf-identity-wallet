import { Request, Response } from "express";
import { CONNECTION_NOT_FOUND, MISSING_CONNECTION_ID } from "../errors";
import { AriesAgent } from "../ariesAgent";
import { ResponseData } from "../types/response.type";
import { httpResponse } from "../utils/response.util";

async function credentialApi(req: Request, res: Response): Promise<void> {
  const connectionId = req.query.connectionId as string;
  if (!connectionId) {
    const response: ResponseData<unknown> = {
      statusCode: 400,
      success: false,
      error: MISSING_CONNECTION_ID,
      data: null,
    };
    httpResponse(res, response);
    return;
  }
  const connectionRecord = await AriesAgent.agent.getConnection(connectionId);
  if (!connectionRecord) {
    const response: ResponseData<unknown> = {
      statusCode: 404,
      success: false,
      error: CONNECTION_NOT_FOUND,
      data: null,
    };
    httpResponse(res, response);
    return;
  }
  await AriesAgent.agent.offerCredential(connectionId);
  const response: ResponseData<string> = {
    statusCode: 200,
    success: true,
    data: "Credential offered",
  };
  httpResponse(res, response);
}

async function createOfferInvitation(_: Request, res: Response): Promise<void> {
  const response: ResponseData<string> = {
    statusCode: 200,
    success: true,
    data: await AriesAgent.agent.createOfferInvitation(),
  };
  httpResponse(res, response);
}

export {
  credentialApi,
  createOfferInvitation
}