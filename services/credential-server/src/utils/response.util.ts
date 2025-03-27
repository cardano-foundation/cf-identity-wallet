import { Response } from "express";
import { ResponseData } from "../types/response.type";
import { config } from "../config";
import { setCache } from "./node-cache";
import { randomSalt } from "./utils";

const MAX_LENGTH_URL_CAN_VIEW_QR_CODE = 200;
const MAX_QR_CODE_TTL = 300;

function httpResponse<T>(res: Response, responseData: ResponseData<T>) {
  res.status(responseData.statusCode).send(responseData);
}

function generableQRcodeWithUrl(url: string): string {
  if (url.length > MAX_LENGTH_URL_CAN_VIEW_QR_CODE) {
    const key = randomSalt();
    setCache(key, url, MAX_QR_CODE_TTL);
    return config.endpoint + "/shorten/" + key;
  }
  return url;
}

export { httpResponse, generableQRcodeWithUrl };
