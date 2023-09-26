import { Request, Response } from "express";
import { getCache } from "../utils/node-cache";

function getFullUrl(req: Request, res: Response) {
  const { id } = req.params;
  const fullUrl = getCache(id);
  if (!fullUrl) {
    return res.status(404).send("Url is invalid or expired");
  }
  return res.redirect(fullUrl);
}

export { getFullUrl };
