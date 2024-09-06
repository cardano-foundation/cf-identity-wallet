import { Request, Response } from "express";
import { ACDC_SCHEMAS } from "../utils/schemas";

async function schemaApi(req: Request, res: Response) {
  const { id } = req.params;
  const data = ACDC_SCHEMAS[id];
  if (!data) {
    return res.status(404).send("Schema for given SAID not found");
  }
  return res.send(data);
}

export { schemaApi };
