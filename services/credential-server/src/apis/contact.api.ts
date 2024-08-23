import { NextFunction, Request, Response } from "express";
import { Agent } from "../agent";
import { ResponseData } from "../types/response.type";
import { httpResponse } from "../utils/response.util";

async function contactList(_: Request, res: Response, next: NextFunction) {
  try {
    const data = await Agent.agent.contacts();
    const response: ResponseData<any> = {
      statusCode: 200,
      success: true,
      data,
    };
    httpResponse(res, response);      
  } catch (error) {
    return next(error);
  }
}

async function deleteContact(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.query;
    const data = await Agent.agent.deleteContact(id as string);
    const response: ResponseData<any> = {
      statusCode: 200,
      success: true,
      data,
    };
    httpResponse(res, response);      
  } catch (error) {
    return next(error);
  }
}

export { contactList, deleteContact };
