import { config } from "../config";
import { getCredentialJsonData, postRequestAndGenQR } from "./utils";
import { log } from "../log";

const API = config.path.invitationWithCredentialConnectionless;

const main = async () => {
  // eslint-disable-next-line no-undef
  const body = process.argv[2];
  let credentialJsonData: unknown;
  if (body) {
    credentialJsonData = JSON.parse(JSON.stringify(getCredentialJsonData(body)).replace("http://127.0.0.1:3001", config.endpoint));
    log("Credential: ", credentialJsonData);
  }
  await postRequestAndGenQR(`${config.endpoint}${API}`, credentialJsonData);
};
void main();
