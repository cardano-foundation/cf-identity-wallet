import { Request, Response } from "express";
import { ACDC_SCHEMAS } from "../utils/schemas";
import { ResponseData } from "../types/response.type";
import { httpResponse } from "../utils/response.util";
import { Agent } from "../agent";

async function schemaApi(req: Request, res: Response) {
  const { id } = req.params;
  const data = ACDC_SCHEMAS[id];
  if (!data) {
    return res.status(404).send("Schema for given SAID not found");
  }
  return res.send(data);
}

async function saidifySchema(req: Request, res: Response) {
  try {
    const sadifiedSchema = Agent.agent.sadifySchema(req.body, "$id");
    const response: ResponseData<string> = {
    statusCode: 200,
    success: true,
    data: JSON.stringify(sadifiedSchema),
  };
  httpResponse(res, response);
  } catch (error: any) {
    console.error("Error during sadify operation:", error);

    const response: ResponseData<string> = {
      statusCode: 500,
      success: false,
      data: error.message || "An unknown error occurred while processing the schema.",
    };
    httpResponse(res, response);
  }
}

export { schemaApi, saidifySchema };
