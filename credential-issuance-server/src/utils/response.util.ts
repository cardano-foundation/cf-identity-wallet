import {Response} from "express";
import {IResponseData} from "../types/response.type";

export function httpResponse<T>(res: Response, responseData: IResponseData<T>) {
  res.status(responseData.statusCode).send(responseData);
}