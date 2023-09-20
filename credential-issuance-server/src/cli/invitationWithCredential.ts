import { config } from "../config";
import { requestAndGenQR } from "./utils";

const API = config.path.invitationWithCredential;

const main = async () => {
  await requestAndGenQR(`${config.endpoint}${API}`);
};
void main();
