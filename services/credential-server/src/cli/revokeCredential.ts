import { config } from "../config";
import { log } from "../log";
import { requestRevokeCredential } from "./utils";

const API = config.path.revokeCredential;

const main = async () => {
  try {
    const holder = process.argv[2];
    const credentialId = process.argv[3];
    await requestRevokeCredential(`${config.endpoint}${API}`, { credentialId, holder });
    process.exit(0);
  } catch (error) {
    log({ error: (error as Error).message });
    process.exit(1);
  }
};
void main();
