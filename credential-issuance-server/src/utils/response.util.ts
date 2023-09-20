import { Response } from "express";
import { ResponseData } from "../types/response.type";
import NodeCache from "node-cache";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config";

const myCache = new NodeCache();

function httpResponse<T>(res: Response, responseData: ResponseData<T>) {
  res.status(responseData.statusCode).send(responseData);
}

function generableQRcodeWithUrl(url: string): string {
  if (url.length > 200) {
    const key = uuidv4();
    myCache.set(key, url);
    return config.endpoint + "/shorten/" + key;
  }
  return url;
}

export { httpResponse, generableQRcodeWithUrl };
