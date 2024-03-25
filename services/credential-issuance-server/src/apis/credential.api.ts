import { Request, Response } from "express";
import { CONNECTION_NOT_FOUND, MISSING_CONNECTION_ID } from "../errors";
import { AriesAgent } from "../ariesAgent";
import { ResponseData } from "../types/response.type";
import { generableQRcodeWithUrl, httpResponse } from "../utils/response.util";
import { SCHEMA_ACDC } from "../utils/schemas/schemaAcdc";

async function offerCredentialOverConnection(
  req: Request,
  res: Response
): Promise<void> {
  const connectionId = req.query.connectionId as string;
  if (!connectionId) {
    const response: ResponseData<unknown> = {
      statusCode: 400,
      success: false,
      error: MISSING_CONNECTION_ID,
      data: null,
    };
    httpResponse(res, response);
    return;
  }
  const connectionRecord = await AriesAgent.agent.getConnection(connectionId);
  if (!connectionRecord) {
    const response: ResponseData<unknown> = {
      statusCode: 404,
      success: false,
      error: CONNECTION_NOT_FOUND,
      data: null,
    };
    httpResponse(res, response);
    return;
  }
  await AriesAgent.agent.offerCredential(connectionId);
  const response: ResponseData<string> = {
    statusCode: 200,
    success: true,
    data: "Credential offered",
  };
  httpResponse(res, response);
}

async function invitationWithCredential(
  req: Request,
  res: Response
): Promise<void> {
  const credential = req.body;
  const response: ResponseData<string> = {
    statusCode: 200,
    success: true,
    data: generableQRcodeWithUrl(
      await AriesAgent.agent.createInvitationWithCredential(
        Object.keys(credential).length === 0 ? undefined : credential
      )
    ),
  };
  httpResponse(res, response);
}

async function invitationWithCredentialConnectionless(
  req: Request,
  res: Response
): Promise<void> {
  const credential = req.body;
  const response: ResponseData<string> = {
    statusCode: 200,
    success: true,
    data: generableQRcodeWithUrl(
      await AriesAgent.agent.createInvitationWithCredentialConnectionless(
        Object.keys(credential).length === 0 ? undefined : credential
      )
    ),
  };
  httpResponse(res, response);
}

async function issueAcdcCredential(
  req: Request,
  res: Response
): Promise<void> {
  const { schemaSaid, aid, name } = req.body;
  if (!SCHEMA_ACDC[schemaSaid]) {
    const response: ResponseData<string> = {
      statusCode: 409,
      success: false,
      data: "",
    };
    return httpResponse(res, response);
  }
  await AriesAgent.agent.issueAcdcCredentialByAid(schemaSaid, aid, name);
  const response: ResponseData<string> = {
    statusCode: 200,
    success: true,
    data: "Credential offered",
  };
  httpResponse(res, response);
}

async function requestDisclosure(
  req: Request,
  res: Response
): Promise<void> {
  const { schemaSaid, aid } = req.body;
  await AriesAgent.agent.requestDisclosure(schemaSaid, aid);
  const response: ResponseData<string> = {
    statusCode: 200,
    success: true,
    data: "Apply schema successfully",
  };
  httpResponse(res, response);
}

export {
  offerCredentialOverConnection,
  invitationWithCredential,
  invitationWithCredentialConnectionless,
  issueAcdcCredential,
  requestDisclosure
};
