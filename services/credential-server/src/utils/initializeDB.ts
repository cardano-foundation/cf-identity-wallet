import { Agent } from "../agent";
import { ACDC_SCHEMAS } from "./schemas";

async function initilizeDB() {
  try {
    for (const schemaKey of Object.keys(ACDC_SCHEMAS)) {
      try {
        await Agent.agent.saveSchema(
          ACDC_SCHEMAS[schemaKey as keyof typeof ACDC_SCHEMAS],
          "$id"
        );
      } catch (error) {
        console.error(`Error saving schema ${schemaKey}:`, error);
      }
    }
  } catch (error) {
    console.error("Error saving schemas:", error);
  }
}

export { initilizeDB };
