import express from "express";
import { config } from "./config";
import { ping } from "./apis/ping.api";
import { invitationApi, keriOobiApi } from "./apis/invitation.api";
import {
  requestDisclosure,
  invitationWithCredential,
  invitationWithCredentialConnectionless,
  issueAcdcCredential,
  offerCredentialOverConnection,
} from "./apis/credential.api";
import { getConnectionByDid } from "./apis/connection.api";
import { createShortenUrl, getFullUrl } from "./apis/shorten.api";
import { summitAccessPass } from "./apis/credential-context";
import { schemaApi } from "./apis/schema.api";
import { contactList } from "./apis/contact.api";
import { resolveOobi } from "./apis/oobi.api";

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
router.post(config.path.issueAcdcCredential, issueAcdcCredential);
router.get(config.path.schemaOobi, schemaApi);
router.post(config.path.resolveOobi, resolveOobi);
router.get(config.path.contacts, contactList);
router.post(config.path.requestDisclosure, requestDisclosure);

export default router;
