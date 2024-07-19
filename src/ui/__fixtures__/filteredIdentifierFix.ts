import { IdentifierShortDetails } from "../../core/agent/services/identifier.types";

const filteredIdentifierFix: IdentifierShortDetails[] = [
  {
    id: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
    displayName: "Professional ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    theme: 0,
    isPending: false,
    signifyName: "Test",
  },
  {
    id: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inx",
    displayName: "Professional ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    theme: 1,
    isPending: false,
    signifyName: "Test",
  },
  {
    id: "ECHG-cxboMQ78Hwlm2-w6OS3iU275bAKkqC1LjwICPyi",
    displayName: "Test MS",
    createdAtUTC: "2024-03-07T11:54:56.886Z",
    theme: 0,
    isPending: true,
    signifyName: "Test",
    multisigManageAid: "123",
  },
];

const multisignIdentifierFix: IdentifierShortDetails[] = [
  {
    id: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
    displayName: "Professional ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    theme: 0,
    isPending: false,
    signifyName: "Test",
    groupMetadata: {
      groupId: "549eb79f-856c-4bb7-8dd5-d5eed865906a",
      groupCreated: false,
      groupInitiator: false,
    },
  },
];

export { filteredIdentifierFix, multisignIdentifierFix };
