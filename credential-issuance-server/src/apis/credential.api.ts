import {Request, Response} from "express";
import {CONNECTION_NOT_FOUND, MISSING_CONNECTION_ID} from "../errors";
import {AriesAgent} from "../ariesAgent";
import {IResponseData} from "../types/response.type";
import {httpResponse} from "../utils/response.util";

export async function credentialApi(req: Request, res: Response): Promise<void> {
  const connectionId = req.query.connectionId as string;
  if (!connectionId) {
    const response: IResponseData<unknown> = {
      statusCode: 400,
      success: false,
      error: MISSING_CONNECTION_ID,
      data: null,
    }
    httpResponse(res, response);
    return;
  }
  const connectionRecord = await AriesAgent.agent.getConnection(connectionId);
  if (!connectionRecord) {
    const response: IResponseData<unknown> = {
      statusCode: 404,
      success: false,
      error: CONNECTION_NOT_FOUND,
      data: null,
    }
    httpResponse(res, response);
    return;
  }
  await AriesAgent.agent.offerCredential(connectionId);
  const response: IResponseData<string> = {
    statusCode: 200,
    success: true,
    data: "Credential offered"
  }
  httpResponse(res, response);
}

export async function createOfferAttachment(_: Request, res: Response): Promise<void> {
  const attachment = await AriesAgent.agent.createOfferAttachment();
  const response: IResponseData<string> = {
    statusCode: 200,
    success: true,
    data: attachment
  }
  httpResponse(res, response);
}