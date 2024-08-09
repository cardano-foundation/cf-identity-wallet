import axios from "axios";
import qrcode from "qrcode-terminal";
import { log } from "../log";

async function requestAndGenQR(endpoint: string) {
  const response = await axios(endpoint);
  const invitationLink = await response.data.data;
  log("Link: ", invitationLink);
  qrcode.generate(invitationLink, { small: true });
}

async function postRequestAndGenQR(endpoint: string, body?: any) {
  const response = await axios.post(endpoint, body);
  const invitationLink = await response.data.data;
  log("Link: ", invitationLink);
  qrcode.generate(invitationLink, { small: true });
}

async function requestRevokeCredential(endpoint: string, body: { credentialId: string; holder: string }) {
  await axios.post(endpoint, body);
  log(`Credential with id ${body.credentialId} has been revoked from holder ${body.holder}`)
}
export { requestAndGenQR, postRequestAndGenQR, requestRevokeCredential };
