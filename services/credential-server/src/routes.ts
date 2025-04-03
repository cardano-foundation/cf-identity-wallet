import express from "express";
import { config } from "./config";
import { ping } from "./apis/ping.api";
import { keriOobiApi } from "./apis/invitation.api";
import {
  requestDisclosure,
  issueAcdcCredential,
  revokeCredential,
  contactCredentials,
} from "./apis/credential.api";
import { createShortenUrl, getFullUrl } from "./apis/shorten.api";
import { contactList, deleteContact } from "./apis/contact.api";
import { resolveOobi } from "./apis/oobi.api";

const router = express.Router();
router.get(config.path.ping, ping);
router.get(config.path.shorten, getFullUrl);
router.post(config.path.createShorten, createShortenUrl);
router.get(config.path.keriOobi, keriOobiApi);
router.post(config.path.issueAcdcCredential, issueAcdcCredential);
router.post(config.path.resolveOobi, resolveOobi);
router.get(config.path.contacts, contactList);
router.get(config.path.contactCredentials, contactCredentials);
router.post(config.path.requestDisclosure, requestDisclosure);
router.post(config.path.revokeCredential, revokeCredential);
router.delete(config.path.deleteContact, deleteContact);

export default router;
