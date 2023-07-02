import { IdentityShortDetails, IdentityType } from "../../core/aries/ariesAgent.types";

const filteredDidsMock: IdentityShortDetails[] = [
  {
    id: "did:key:z6MkpNyGdYK5Ey1pCf5cy1S9gbLD1857nQoZxVeeGifA1ZQv",
    method: IdentityType.KEY,
    displayName: "Anonymous ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
  },
  {
    id: "did:key:z6MkpNyGdYK5Ey1pCf5cyQoZxVeeGifA1ZQv1S9gbLD1857n",
    method: IdentityType.KEY,
    displayName: "Public ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
  },
  {
    id: "did:key:z6MkpNycy1S9gpCf5857nQoZxVbLD1GdYK5Ey1eeGifA1ZQv",
    method: IdentityType.KEY,
    displayName: "Offline ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
  },
  {
    id: "did:key:z6MkpNyGd9gbLD1857nQoZYK5Ey1pCf5cy1SxVeeGifA1ZQv",
    method: IdentityType.KERI,
    displayName: "Professional ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
  },
  {
    id: "did:key:z6MkpNycy1S9gpCf5857nQoZxVbLD1GdYK5Ey1eeGifA1ZQvb",
    method: IdentityType.KERI,
    displayName: "Offline ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
  },
];

export { filteredDidsMock };
