import { Response } from "express";
import { ResponseData } from "../types/response.type";

function httpResponse<T>(res: Response, responseData: ResponseData<T>) {
  res.status(responseData.statusCode).send(responseData);
}

export {
  httpResponse,
};