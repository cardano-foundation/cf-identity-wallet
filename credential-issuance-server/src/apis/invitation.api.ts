import { Request, Response } from "express";
import { AriesAgent } from "../ariesAgent";
import { ResponseData } from "../types/response.type";
import { generableQRcodeWithUrl, httpResponse } from "../utils/response.util";

async function invitationApi(_: Request, res: Response) {
  const { url } = await AriesAgent.agent.createInvitation();
  const response: ResponseData<string> = {
    statusCode: 200,
    success: true,
    data: generableQRcodeWithUrl(url),
  };
  httpResponse(res, response);
}

export { invitationApi };
