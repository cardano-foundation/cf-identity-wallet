import {Request, Response} from "express";
import {AriesAgent} from "../ariesAgent";
import {IResponseData} from "../types/response.type";
import {httpResponse} from "../utils/response.util";
import {log} from "../log";

export async function invitationApi(_: Request, res: Response) {
  const invitationLink = await AriesAgent.agent.createInvitation();
  log("Invitation link: ", invitationLink);
  const response: IResponseData<string> = {
    statusCode: 200,
    success: true,
    data: invitationLink,
  }
  httpResponse(res, response);
}