import express from "express";
import { config } from "./config";
import { ping } from "./apis/ping.api";
import { invitationApi } from "./apis/invitation.api";
import {
  invitationWithCredential,
  invitationWithCredentialConnectionless,
  offerCredentialOverConnection,
} from "./apis/credential.api";
import { getConnectionByDid } from "./apis/connection.api";
import { getShortenUrl, getFullUrl } from "./apis/shorten.api";
import { summitAccessPass } from "./apis/credential-context";

const router = express.Router();
router.get(config.path.ping, ping);
router.get(config.path.getConnectionByDid, getConnectionByDid);
router.get(config.path.invitation, invitationApi);
router.get(config.path.credential, offerCredentialOverConnection);
router.post(config.path.invitationWithCredential, invitationWithCredential);
router.post(
  config.path.invitationWithCredentialConnectionless,
  invitationWithCredentialConnectionless
);
router.get(config.path.shorten, getFullUrl);
router.post(config.path.getShorten, getShortenUrl);
router.get(config.path.credentials.summit, summitAccessPass);

export default router;
