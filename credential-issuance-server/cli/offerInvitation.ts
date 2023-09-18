import qrcode from "qrcode-terminal";
import axios from "axios";

const API = "/createOfferInvitation";

const main = async () => {
  let [host] = process.argv.slice(2);
  if (!host) host = "http://localhost:3001";
  const response = await axios(host + API, {
    headers: { "Content-Type": "application/ssi-agent-wire" },
  });
  const invitationLink = await response.data.data;
  console.log("Link: ", invitationLink);
  qrcode.generate(invitationLink, { small: true });
};
void main();
