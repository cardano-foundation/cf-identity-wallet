import express from "express";
import { config } from "./config";
import { ping } from "./apis/ping.api";
import { invitationApi } from "./apis/invitation.api";
import {
  invitationWithCredential,
  invitationWithCredentialConnectionless,
  credentialApi,
} from "./apis/credential.api";

const router = express.Router();
router.get(config.path.ping, ping);
router.get(config.path.invitation, invitationApi);
router.get(config.path.credential, credentialApi);
router.get(config.path.createOfferInvitation, invitationWithCredential);
router.get(
  config.path.createOfferInvitationWithConnectionLess,
  invitationWithCredentialConnectionless
);

export default router;
