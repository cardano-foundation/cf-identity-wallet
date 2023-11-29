import { Request, Response } from "express";
import { getCache } from "../utils/node-cache";
import { ResponseData } from "../types/response.type";
import { generableQRcodeWithUrl, httpResponse } from "../utils/response.util";

function getFullUrl(req: Request, res: Response) {
  const { id } = req.params;
  const fullUrl = getCache(id);
  if (!fullUrl) {
    return res.status(404).send("Url is invalid or expired");
  }
  return res.send(fullUrl);
}

async function createShortenUrl(req: Request, res: Response) {
  const { url } = req.body;
  const response: ResponseData<string> = {
    statusCode: 200,
    success: true,
    data: generableQRcodeWithUrl(url as string),
  };
  httpResponse(res, response);
}

export { getFullUrl, createShortenUrl };
