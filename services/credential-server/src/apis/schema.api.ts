import { Request, Response } from "express";
import { join } from "path";
import { readFile } from "fs/promises";

async function schemaApi(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const schemaPath = join(__dirname, "..", "schemas", id);

    const schemaContent = await readFile(schemaPath, "utf8");

    const schemaData = JSON.parse(schemaContent);

    res.send(schemaData);
  } catch (error) {
    res.status(404).send("Schema for given SAID not found");
  }
}

export { schemaApi };
