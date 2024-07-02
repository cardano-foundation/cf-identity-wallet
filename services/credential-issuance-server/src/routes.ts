import express from "express";
import { config } from "./config";
import { ping } from "./apis/ping.api";
import { keriOobiApi } from "./apis/invitation.api";
import { requestDisclosure, issueAcdcCredential, issueLeChainedCredential } from "./apis/credential.api";
import { createShortenUrl, getFullUrl } from "./apis/shorten.api";
import { schemaApi } from "./apis/schema.api";
import { contactList } from "./apis/contact.api";
import { resolveOobi } from "./apis/oobi.api";

const router = express.Router();
router.get(config.path.ping, ping);
router.get(config.path.shorten, getFullUrl);
router.post(config.path.createShorten, createShortenUrl);
router.get(config.path.keriOobi, keriOobiApi);
router.post(config.path.issueAcdcCredential, issueAcdcCredential);
router.post(config.path.issueLeCredential, issueLeChainedCredential);
router.get(config.path.schemaOobi, schemaApi);
router.post(config.path.resolveOobi, resolveOobi);
router.get(config.path.contacts, contactList);
router.post(config.path.requestDisclosure, requestDisclosure);

export default router;
