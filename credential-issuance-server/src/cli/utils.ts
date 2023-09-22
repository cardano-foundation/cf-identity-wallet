import axios from "axios";
import qrcode from "qrcode-terminal";
import { log } from "../log";

async function requestAndGenQR(endpoint: string) {
  const response = await axios(endpoint);
  const invitationLink = await response.data.data;
  log("Link: ", invitationLink);
  qrcode.generate(invitationLink, { small: true });
}

export { requestAndGenQR };
