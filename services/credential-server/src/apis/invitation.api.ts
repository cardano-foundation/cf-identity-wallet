import { NextFunction, Request, Response } from "express";
import { Agent } from "../agent";
import { ResponseData } from "../types/response.type";
import { generableQRcodeWithUrl, httpResponse } from "../utils/response.util";

async function keriOobiApi(_: Request, res: Response, next: NextFunction) {
  const url = await Agent.agent.createKeriOobi();
  const response: ResponseData<string> = {
    statusCode: 200,
    success: true,
    data: generableQRcodeWithUrl(url),
  };
  httpResponse(res, response);
}

export { keriOobiApi };
