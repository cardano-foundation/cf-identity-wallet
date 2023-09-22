import {
  IdentifierShortDetails,
  IdentifierType,
} from "../../core/agent/agent.types";

const filteredDidFix: IdentifierShortDetails[] = [
  {
    id: "did:key:z6MkpNyGdYK5Ey1pCf5cy1S9gbLD1857nQoZxVeeGifA1ZQv",
    method: IdentifierType.KEY,
    displayName: "Anonymous ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    colors: ["#92FFC0", "#47FF94"],
  },
  {
    id: "did:key:z6MkpNyGdYK5Ey1pCf5cyQoZxVeeGifA1ZQv1S9gbLD1857n",
    method: IdentifierType.KEY,
    displayName: "Public ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    colors: ["#FFBC60", "#FFA21F"],
  },
  {
    id: "did:key:z6MkpNycy1S9gpCf5857nQoZxVbLD1GdYK5Ey1eeGifA1ZQv",
    method: IdentifierType.KEY,
    displayName: "Offline ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    colors: ["#D9EDDF", "#ACD8B9"],
  },
  {
    id: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
    method: IdentifierType.KERI,
    displayName: "Professional ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    colors: ["#47E0FF", "#00C6EF"],
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
