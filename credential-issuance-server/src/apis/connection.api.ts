import { Request, Response } from "express";
import { ResponseData } from "../types/response.type";
import { CONNECTION_NOT_FOUND, MISSING_DID_ID } from "../errors";
import { httpResponse } from "../utils/response.util";
import { AriesAgent } from "../ariesAgent";

async function getConnectionByDid(req: Request, res: Response): Promise<void> {
  const did = req.query.did as string;
  if (!did) {
    const response: ResponseData<unknown> = {
      statusCode: 400,
      success: false,
      error: MISSING_DID_ID,
      data: null,
    };
    httpResponse(res, response);
    return;
  }
  const connectionRecord = await AriesAgent.agent.getConnectionByDidOfInvitee(did);
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
  const response: ResponseData<{connectionId: string}> = {
    statusCode: 200,
    success: true,
    data: {
      connectionId: connectionRecord.id,
    },
  };
  httpResponse(res, response);
}

export { getConnectionByDid };