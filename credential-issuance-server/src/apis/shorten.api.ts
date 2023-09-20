import { Request, Response } from "express";
import NodeCache from "node-cache";

const myCache = new NodeCache();

function getFullUrl(req: Request, res: Response) {
  const { id } = req.params;
  res.redirect(myCache.get(id) || "");
}

export { getFullUrl };
