import { NextFunction, Request, Response } from "express";
import { Agent } from "../agent";
import { ResponseData } from "../types/response.type";
import { httpResponse } from "../utils/response.util";

async function resolveOobi(req: Request, res: Response, next: NextFunction) {
  const { oobi } = req.body;
  await Agent.agent.resolveOobi(oobi);
  const response: ResponseData<string> = {
    statusCode: 200,
    success: true,
    data: "OOBI resolved successfully",
  };
  httpResponse(res, response);      
}

export { resolveOobi };
