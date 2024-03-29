import {
  IdentifierShortDetails,
  IdentifierType,
} from "../../core/agent/services/identifierService.types";

const filteredDidFix: IdentifierShortDetails[] = [
  {
    id: "did:key:z6MkpNyGdCf5cy1S9gbLD1857YK5Ey1pnQoZxVeeGifA1ZQv",
    method: IdentifierType.KEY,
    displayName: "Anonymous ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    colors: ["#92FFC0", "#47FF94"],
    theme: 0,
    isPending: false,
  },
  {
    id: "did:key:z6MkpNyGdCf5cy1S9gbLD1857YK5Ey1pnQoZxVeeGifA1ZQx",
    method: IdentifierType.KEY,
    displayName: "Anonymous ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    colors: ["#92FFC0", "#47FF94"],
    theme: 1,
    isPending: false,
  },
];

const filteredKeriFix: IdentifierShortDetails[] = [
  {
    id: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
    method: IdentifierType.KERI,
    displayName: "Professional ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    colors: ["#47E0FF", "#00C6EF"],
    theme: 0,
    isPending: false,
  },
  {
    id: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inx",
    method: IdentifierType.KERI,
    displayName: "Professional ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    colors: ["#47E0FF", "#00C6EF"],
    theme: 1,
    isPending: false,
  },
  {
    id: "ECHG-cxboMQ78Hwlm2-w6OS3iU275bAKkqC1LjwICPyi",
    method: IdentifierType.KERI,
    displayName: "Test MS",
    createdAtUTC: "2024-03-07T11:54:56.886Z",
    colors: ["#000000", "#000000"],
    theme: 4,
    isPending: true,
  },
];

const filteredIdentifierFix = [...filteredDidFix, ...filteredKeriFix];

export { filteredDidFix, filteredKeriFix, filteredIdentifierFix };
