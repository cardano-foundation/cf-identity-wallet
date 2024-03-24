import { Request, Response } from "express";
import { AriesAgent } from "../agent";
import { ResponseData } from "../types/response.type";
import { httpResponse } from "../utils/response.util";

async function issueCredentialWithKeriOobi(
  req: Request,
  res: Response
): Promise<void> {
  const { oobi } = req.body;
  await AriesAgent.agent.issueAcdcCredentialByOobi(oobi);
  const response: ResponseData<string> = {
    statusCode: 200,
    success: true,
    data: "Credential offered",
  };
  httpResponse(res, response);
}

export { issueCredentialWithKeriOobi };
