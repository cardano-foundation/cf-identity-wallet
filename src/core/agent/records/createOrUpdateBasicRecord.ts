import { BasicRecord } from "./basicRecord";
import { Agent } from "../agent";

export async function createOrUpdateBasicRecord(record: BasicRecord) {
  const existingRecord = await Agent.agent.basicStorage.findById(record.id);
  if (existingRecord) {
    await Agent.agent.basicStorage.update(record);
  } else {
    await Agent.agent.basicStorage.save(record);
  }
}
