import { NextFunction, Request, Response } from "express";
import { Agent } from "../agent";

async function contactList(_: Request, res: Response, next: NextFunction) {
  const data = await Agent.contacts();
  res.status(200).send({
    success: true,
    data,
  });
}

async function deleteContact(req: Request, res: Response, next: NextFunction) {
  const { id } = req.query;
  const data = await Agent.deleteContact(id as string);
  res.status(200).send({
    success: true,
    data,
  });
}

export { contactList, deleteContact };
