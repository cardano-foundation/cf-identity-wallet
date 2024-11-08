import { Request, Response } from "express";
import { ResponseData } from "../types/response.type";
import { httpResponse } from "../utils/response.util";
import { Agent } from "../agent";
import lmdb from "../utils/lmdb";
import { SCHEMAS_KEY, SchemaShortDetails } from "../types/schema.type";

async function schemaApi(req: Request, res: Response) {
  const { id } = req.params;
  const schemas = await lmdb.get(SCHEMAS_KEY);
  if (!schemas) {
    return res.status(404).send("No schemas found");
  }

  const schema = schemas[id];
  if (!schema) {
    return res.status(404).send("Schema for given SAID not found");
  }

  const data = schema.schema;
  if (!data) {
    return res.status(404).send("Schema data not found");
  }

  return res.send(data);
}

function schemaList(req: Request, res: Response) {
  const schemas = lmdb.get(SCHEMAS_KEY);
  if (!schemas) {
    return res.status(404).send("No schemas found");
  }

  const schemaDetailsList: Array<SchemaShortDetails> = [];

  Object.entries(schemas).forEach(([id, schema]) => {
    const typedSchema = (schema as any).schema;
    schemaDetailsList.push({
      $id: typedSchema.$id,
      title: typedSchema.title,
    });
  });

  return res.send(schemaDetailsList);
}

async function schemaCustomFields(req: Request, res: Response) {
  const { id } = req.query;
  const schemas = await lmdb.get(SCHEMAS_KEY);
  if (!schemas) {
    return res.status(404).send("No schemas found");
  }

  const data = schemas[id as string];
  if (!data) {
    return res.status(404).send("Schema for given SAID not found");
  }

  return res.send({ customizableKeys: data.customizableKeys });
}

async function saveSchema(req: Request, res: Response) {
  try {
    await Agent.agent.saidifySchema(req.body, "$id");
    const response: ResponseData<string> = {
      statusCode: 200,
      success: true,
      data: "Schema succesfully generated",
    };
    httpResponse(res, response);
  } catch (error: any) {
    console.error("Error during sadify operation:", error);

    const response: ResponseData<string> = {
      statusCode: 500,
      success: false,
      data:
        error.message ||
        "An unknown error occurred while processing the schema.",
    };
    httpResponse(res, response);
  }
}

async function deleteSchema(req: Request, res: Response) {
  const { id } = req.query;
  const schemas = await lmdb.get(SCHEMAS_KEY);
  if (!schemas) {
    return res.status(404).send("No schemas found");
  }

  delete schemas[id as string];
  await lmdb.put(SCHEMAS_KEY, schemas);

  return res.send("Schema deleted successfully");
}

export { schemaApi, schemaList, schemaCustomFields, saveSchema, deleteSchema };
