import { Request, Response } from "express";
import { Agent } from "../ariesAgent";
import { ResponseData } from "../types/response.type";
import { httpResponse } from "../utils/response.util";

async function contactList(_: Request, res: Response) {
  const data = await Agent.agent.contacts();
  const response: ResponseData<any> = {
    statusCode: 200,
    success: true,
    data,
  };
  httpResponse(res, response);
}

export { contactList };
