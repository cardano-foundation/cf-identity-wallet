import { config } from "../config";
import { requestAndGenQR } from "./utils";

const API = config.path.createOfferInvitationWithConnectionLess;

const main = async () => {
  let host = config.endpoint;
  if (!host) host = "http://localhost:3001";
  await requestAndGenQR(`${host}${API}`);
};
void main();
