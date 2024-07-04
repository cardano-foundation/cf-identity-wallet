import { Request, Response } from "express";
import { SCHEMA_ACDC } from "../utils/schemas/schemaAcdc";

async function schemaApi(req: Request, res: Response) {
  const { id } = req.params;
  const data = SCHEMA_ACDC[id];
  if (!data) {
    return res.status(404).send("Schema for given SAID not found");
  }
  return res.send(data);
}

export { schemaApi };
