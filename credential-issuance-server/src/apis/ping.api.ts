import {Request, Response} from "express";
import {IResponseData} from "../types/response.type";
import {httpResponse} from "../utils/response.util";

export function ping(_: Request, res: Response) {
  const response: IResponseData<string> = {
    statusCode: 200,
    success: true,
    data: "pong",
  }
  httpResponse(res, response);
}