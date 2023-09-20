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
import { getFullUrl } from "./apis/shorten.api";

const router = express.Router();
router.get(config.path.ping, ping);
router.get(config.path.getConnectionByDid, getConnectionByDid);
router.get(config.path.invitation, invitationApi);
router.get(config.path.credential, offerCredentialOverConnection);
router.get(config.path.invitationWithCredential, invitationWithCredential);
router.get(
  config.path.invitationWithCredentialConnectionless,
  invitationWithCredentialConnectionless
);
router.get(
  config.path.invitationWithCredentialConnectionless,
  invitationWithCredentialConnectionless
);
router.get(config.path.shorten, getFullUrl);

export default router;
