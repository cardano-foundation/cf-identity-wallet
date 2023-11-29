import express from "express";
import { config } from "./config";
import { ping } from "./apis/ping.api";
import { invitationApi, keriOobiApi } from "./apis/invitation.api";
import {
  invitationWithCredential,
  invitationWithCredentialConnectionless,
  issueCredentialWithKeriOobi,
  offerCredentialOverConnection,
} from "./apis/credential.api";
import { getConnectionByDid } from "./apis/connection.api";
import { createShortenUrl, getFullUrl } from "./apis/shorten.api";
import { summitAccessPass } from "./apis/credential-context";
import { schemaApi } from "./apis/schema.api";

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
router.post(config.path.createShorten, createShortenUrl);
router.get(config.path.credentials.summit, summitAccessPass);
router.get(config.path.keriOobi, keriOobiApi);
router.post(config.path.issueAcdcCredentialWithOobi, issueCredentialWithKeriOobi);
router.get(config.path.schemaOobi, schemaApi);

export default router;
