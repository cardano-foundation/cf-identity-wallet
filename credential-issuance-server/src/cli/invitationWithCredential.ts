import { config } from "../config";
import { getCredentialJsonData, postRequestAndGenQR } from "./utils";
import { log } from "../log";

const API = config.path.invitationWithCredential;

const main = async () => {
  // eslint-disable-next-line no-undef
  const body = process.argv[2];
  const credentialJsonData = getCredentialJsonData(body);
  log("Credential: ", credentialJsonData);
  await postRequestAndGenQR(`${config.endpoint}${API}`, credentialJsonData);
};
void main();
