import { Request, Response } from "express";
import { AriesAgent } from "../ariesAgent";
import { IResponseData } from "../types/response.type";
import { httpResponse } from "../utils/response.util";

export async function invitationApi(_: Request, res: Response) {
  const { url } = await AriesAgent.agent.createInvitation();
  const response: IResponseData<string> = {
    statusCode: 200,
    success: true,
    data: url,
  };
  httpResponse(res, response);
}
