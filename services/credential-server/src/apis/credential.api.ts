import { Request, Response } from "express";
import { Agent } from "../agent";
import { ResponseData } from "../types/response.type";
import { httpResponse } from "../utils/response.util";
import { SCHEMA_ACDC } from "../utils/schemas/schemaAcdc";
import { log } from "../log";

async function issueAcdcCredential(req: Request, res: Response): Promise<void> {
  const { schemaSaid, aid, attribute } = req.body;
  if (!SCHEMA_ACDC[schemaSaid]) {
    const response: ResponseData<string> = {
      statusCode: 409,
      success: false,
      data: "",
    };
    return httpResponse(res, response);
  }
  await Agent.agent.issueAcdcCredentialByAid(schemaSaid, aid, attribute);
  const response: ResponseData<string> = {
    statusCode: 200,
    success: true,
    data: "Credential offered",
  };
  httpResponse(res, response);
}

async function requestDisclosure(req: Request, res: Response): Promise<void> {
  const { schemaSaid, aid, attributes } = req.body;
  await Agent.agent.requestDisclosure(schemaSaid, aid, attributes);
  const response: ResponseData<string> = {
    statusCode: 200,
    success: true,
    data: "Apply schema successfully",
  };
  httpResponse(res, response);
}

async function revokeCredential(req: Request, res: Response): Promise<void> {
  const { credentialId, holder } = req.body;
  let response: ResponseData<string> = {
    statusCode: 200,
    success: true,
    data: "Revoke credential successfully",
  };
  try {
    await Agent.agent.revokeCredential(credentialId, holder);
  } catch (error) {
    log({ error: (error as Error).message })
    response = {
      statusCode: 500,
      success: false,
      data: (error as Error).message,
    }
  }
  httpResponse(res, response);
}

export { issueAcdcCredential, requestDisclosure, revokeCredential };
