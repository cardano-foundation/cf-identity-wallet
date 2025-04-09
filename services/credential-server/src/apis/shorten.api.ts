import { Request, Response } from "express";
import { getCache } from "../utils/node-cache";
import { generableQRcodeWithUrl } from "../utils/response.util";

function getFullUrl(req: Request, res: Response) {
  const { id } = req.params;
  const fullUrl = getCache(id);
  if (!fullUrl) {
    res.status(404).send("Url is invalid or expired");
    return;
  }
  res.send(fullUrl);
}

async function createShortenUrl(req: Request, res: Response) {
  const { url } = req.body;
  res.status(200).send({
    success: true,
    data: generableQRcodeWithUrl(url as string),
  });
}

export { getFullUrl, createShortenUrl };
