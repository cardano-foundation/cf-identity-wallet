import {
  DIDDetails,
  IdentityType,
  KERIDetails,
} from "../../core/aries/ariesAgent.types";

const didFix: DIDDetails[] = [
  {
    id: "did:key:z6MkpNyGdYK5Ey1pCf5cy1S9gbLD1857nQoZxVeeGifA1ZQv",
    method: IdentityType.KEY,
    displayName: "Anonymous ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    colors: ["#92FFC0", "#47FF94"],
    keyType: "Ed25519",
    controller: "did:key:z6MkpNyGdCf5cy1S9gbLD1857YK5Ey1pnQoZxVeeGifA1ZQv",
    publicKeyBase58: "AviE3J4duRXM6AEvHSUJqVnDBYoGNXZDGUjiSSh96LdY",
  },
  {
    id: "did:key:z6MkpNyGdYK5Ey1pCf5cyQoZxVeeGifA1ZQv1S9gbLD1857n",
    method: IdentityType.KEY,
    displayName: "Public ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    colors: ["#FFBC60", "#FFA21F"],
    keyType: "Ed25519",
    controller: "did:key:z6MkpNyGdYK5Ey1pCf5cyQoZxVeeGifA1ZQv1S9gbLD1857n",
    publicKeyBase58: "AviE3J4dnDBYoGNXZDGUjiSSh96uRXM6AEvHSUJqVLdY",
  },
  {
    id: "did:key:z6MkpNycy1S9gpCf5857nQoZxVbLD1GdYK5Ey1eeGifA1ZQv",
    method: IdentityType.KEY,
    displayName: "Offline ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    colors: ["#D9EDDF", "#ACD8B9"],
    keyType: "Ed25519",
    controller: "did:key:z6MkpNycy1S9gpCf5857nQoZxVbLD1GdYK5Ey1eeGifA1ZQv",
    publicKeyBase58: "AviE3J4duRYoGNXZDGUjiSShXM6AEvHSUJqVnDB96LdY",
  },
];

const keriFix: KERIDetails[] = [
  {
    id: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
    method: IdentityType.KERI,
    displayName: "Professional ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    colors: ["#47E0FF", "#00C6EF"],
    s: 0, // Sequence number, only show if s > 0
    dt: "2023-06-12T14:07:53.224866+00:00", // Last key rotation timestamp, if s > 0
    kt: 1, // Keys signing threshold (only show if kt > 1)
    k: [
      // List of signing keys - array
      "DCF6b0c5aVm_26_sCTgLB4An6oUxEM5pVDDLqxxXDxH-",
    ],
    nt: 1, // Next keys signing threshold
    n: [
      // Next keys digests - array
      "EIZ-n_hHHY5ERGTzvpXYBkB6_yBAM4RXcjQG3-JykFvF",
    ],
    bt: 1, // Backer threshold and backer keys below
    b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"], // List of backers
    di: "", // Delegated identifier prefix, don't show if ""
  },
];

// @TODO - foconnor: When UI in place for KERI, need KERIDetails here too.
const identityFix = [...didFix, ...keriFix];

export { didFix, keriFix, identityFix };
