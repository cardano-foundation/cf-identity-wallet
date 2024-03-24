import express from "express";
import { config } from "./config";
import { ping } from "./apis/ping.api";
import { keriOobiApi } from "./apis/invitation.api";
import { issueCredentialWithKeriOobi } from "./apis/credential.api";
import { createShortenUrl, getFullUrl } from "./apis/shorten.api";
import { schemaApi } from "./apis/schema.api";

const router = express.Router();
router.get(config.path.ping, ping);
router.get(config.path.shorten, getFullUrl);
router.post(config.path.createShorten, createShortenUrl);
router.get(config.path.keriOobi, keriOobiApi);
router.post(
  config.path.issueAcdcCredentialWithOobi,
  issueCredentialWithKeriOobi
);
router.get(config.path.schemaOobi, schemaApi);

export default router;
