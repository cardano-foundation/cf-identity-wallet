import { NextFunction, Request, Response } from "express";
import { Agent } from "../agent";
import { generableQRcodeWithUrl } from "../utils/response.util";

async function keriOobiApi(_: Request, res: Response, next: NextFunction) {
  const url = await Agent.createKeriOobi();
  res.status(200).send({
    success: true,
    data: generableQRcodeWithUrl(url),
  });
}

export { keriOobiApi };
