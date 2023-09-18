import { Request, Response } from "express";
import { AriesAgent } from "../ariesAgent";
import { ResponseData } from "../types/response.type";
import { httpResponse } from "../utils/response.util";

async function invitationApi(_: Request, res: Response) {
  const { url } = await AriesAgent.agent.createInvitation();
  const response: ResponseData<string> = {
    statusCode: 200,
    success: true,
    data: url,
  };
  httpResponse(res, response);
}

export {
  invitationApi,
};