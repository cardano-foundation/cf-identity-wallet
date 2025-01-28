import { IdentifierShortDetails } from "../../core/agent/services/identifier.types";

const filteredIdentifierFix: IdentifierShortDetails[] = [
  {
    id: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
    displayName: "Professional ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    theme: 0,
    isPending: false,
  },
  {
    id: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inx",
    displayName: "Professional ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    theme: 1,
    isPending: false,
  },
  {
    id: "ECHG-cxboMQ78Hwlm2-w6OS3iU275bAKkqC1LjwICPyi",
    displayName: "Test MS",
    createdAtUTC: "2024-03-07T11:54:56.886Z",
    theme: 0,
    isPending: true,
    multisigManageAid: "123",
  },
  {
    displayName: "GID 1",
    id: "EIRdVIgcPYj6LbN4DdxzJFnsvELV-7eWDBQ4a-VsRDQb",
    createdAtUTC: "2024-10-21T11:15:58.673Z",
    theme: 0,
    isPending: false,
    multisigManageAid: "EHzi_GBx0jIgd3G0Qqcjg3ZaLJ6d84wp6q0qUvC_iOQ4",
  },
  {
    displayName: "Profess",
    id: "EE-gjeEni5eCdpFlBtG7s4wkv7LJ0JmWplCS4DNQwW2G",
    createdAtUTC: "2024-10-21T11:15:58.673Z",
    theme: 0,
    isPending: false,
  },
];

const filteredIdentifierMapFix = filteredIdentifierFix.reduce((result, next) => {
  result[next.id] = next;

  return result;
}, {} as Record<string, IdentifierShortDetails>);

const multisignIdentifierFix: IdentifierShortDetails[] = [
  {
    id: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
    displayName: "Professional ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    theme: 0,
    isPending: false,
    groupMetadata: {
      groupId: "549eb79f-856c-4bb7-8dd5-d5eed865906a",
      groupCreated: false,
      groupInitiator: false,
    },
  },
];

const pendingMultisignIdentifierFix: IdentifierShortDetails[] = [
  {
    id: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
    displayName: "Professional ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    theme: 0,
    isPending: true,
    groupMetadata: {
      groupId: "549eb79f-856c-4bb7-8dd5-d5eed865906a",
      groupCreated: false,
      groupInitiator: false,
    },
  },
];

export {
  filteredIdentifierMapFix,
  filteredIdentifierFix,
  multisignIdentifierFix,
  pendingMultisignIdentifierFix,
};
