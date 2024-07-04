import { config } from "../config";

export async function resolveOobi(oobi: string) {
  try {
    await (
      await fetch(`${config.endpoint}${config.path.resolveOobi}`, {
        method: "POST",
        body: JSON.stringify({ oobi }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();
  } catch (e) {
    console.error(e);
  }
}
