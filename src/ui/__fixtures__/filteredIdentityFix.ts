import {
  IdentifierShortDetails,
  IdentifierType,
} from "../../core/agent/agent.types";

const filteredDidFix: IdentifierShortDetails[] = [
  {
    id: "did:key:z6MkpNyGdCf5cy1S9gbLD1857YK5Ey1pnQoZxVeeGifA1ZQv",
    method: IdentifierType.KEY,
    displayName: "Anonymous ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    colors: ["#92FFC0", "#47FF94"],
  },
];

const filteredKeriFix: IdentifierShortDetails[] = [
  {
    id: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
    method: IdentifierType.KERI,
    displayName: "Professional ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    colors: ["#47E0FF", "#00C6EF"],
  },
];

const filteredIdentityFix = [...filteredDidFix, ...filteredKeriFix];

export { filteredDidFix, filteredKeriFix, filteredIdentityFix };
