import { NextFunction, Request, Response } from "express";
import { Agent } from "../agent";

async function resolveOobi(req: Request, res: Response, next: NextFunction) {
  const { oobi } = req.body;
  await Agent.resolveOobi(oobi);
  res.status(200).send({
    success: true,
    data: "OOBI resolved successfully",
  });
}

export { resolveOobi };
