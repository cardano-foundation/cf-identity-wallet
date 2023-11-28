import { Request, Response } from "express";
import { SCHEMA_ACDC } from "../utils/contexts/schemaAcdc";

async function schemaApi(req: Request, res: Response) {
  const { id } = req.params;
  const data = SCHEMA_ACDC[id];
  if (!data) {
    return res.status(404).send("Schema said is not valid");
  }
  return res.send(data);
}

export { schemaApi };
