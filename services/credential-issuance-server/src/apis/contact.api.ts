import { Request, Response } from "express";
import { AriesAgent } from "../ariesAgent";
import { ResponseData } from "../types/response.type";
import { httpResponse } from "../utils/response.util";

async function contactList(_: Request, res: Response) {
  const data = await AriesAgent.agent.contacts();
  const response: ResponseData<any> = {
    statusCode: 200,
    success: true,
    data,
  };
  httpResponse(res, response);
}

export { contactList };
