import { IdentifierDetails } from "../../core/agent/services/identifier.types";
import { CreationStatus } from "../../core/agent/agent.types";

const identifierFix: IdentifierDetails[] = [
  {
    id: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inb",
    displayName: "Professional ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    theme: 0,
    creationStatus: CreationStatus.COMPLETE,
    s: "4", // Sequence number, only show if s > 0
    dt: "2023-06-12T14:07:53.224866+00:00", // Last key rotation timestamp, if s > 0
    kt: "2", // Keys signing threshold (only show for group identifiers)
    k: [
      // List of signing keys - array
      "DCF6b0c5aVm_26_sCTgLB4An6oUxEM5pVDDLqxxXDxH-",
    ],
    nt: "3", // Next keys signing threshold, only show if nt > 1
    n: [
      // Next keys digests - array
      "EIZ-n_hHHY5ERGTzvpXYBkB6_yBAM4RXcjQG3-JykFvF",
    ],
    bt: "1", // Backer threshold and backer keys below
    b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"], // List of backers
    di: "test", // Delegated identifier prefix, don't show if ""
  },
  {
    id: "ED4KeyyTKFj-72B008OTGgDCrFo6y7B2B73kfyzu5Inx",
    displayName: "Professional ID",
    createdAtUTC: "2023-01-01T19:23:24Z",
    theme: 1,
    creationStatus: CreationStatus.COMPLETE,
    s: "4", // Sequence number, only show if s > 0
    dt: "2023-06-12T14:07:53.224866+00:00", // Last key rotation timestamp, if s > 0
    kt: "2", // Keys signing threshold (only show for group identifiers)
    k: [
      // List of signing keys - array
      "DCF6b0c5aVm_26_sCTgLB4An6oUxEM5pVDDLqxxXDxH-",
    ],
    nt: "3", // Next keys signing threshold, only show if nt > 1
    n: [
      // Next keys digests - array
      "EIZ-n_hHHY5ERGTzvpXYBkB6_yBAM4RXcjQG3-JykFvF",
    ],
    bt: "1", // Backer threshold and backer keys below
    b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"], // List of backers
    di: "test", // Delegated identifier prefix, don't show if ""
  },
  {
    id: "ECHG-cxboMQ78Hwlm2-w6OS3iU275bAKkqC1LjwICPyi",
    displayName: "Test MS",
    createdAtUTC: "2024-03-07T11:54:56.886Z",
    theme: 0,
    creationStatus: CreationStatus.PENDING,
    s: "4", // Sequence number, only show if s > 0
    dt: "2023-06-12T14:07:53.224866+00:00", // Last key rotation timestamp, if s > 0
    kt: "2", // Keys signing threshold (only show for group identifiers)
    k: [
      // List of signing keys - array
      "DCF6b0c5aVm_26_sCTgLB4An6oUxEM5pVDDLqxxXDxH-",
    ],
    nt: "3", // Next keys signing threshold, only show if nt > 1
    n: [
      // Next keys digests - array
      "EIZ-n_hHHY5ERGTzvpXYBkB6_yBAM4RXcjQG3-JykFvF",
    ],
    bt: "1", // Backer threshold and backer keys below
    b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"], // List of backers
    di: "test", // Delegated identifier prefix, don't show if "",
    groupMemberPre: "ELUXM-ajSu0o1qyFvss-3QQfkj3DOke9aHNwt72Byi9x",
    members: [
      "EFZ-hSogn3-wXEahBbIW_oXYxAV_vH8eEhX6BwQHsYBu",
      "EFZ-hSogn3-wXEahBbIW_oXYxAV_vH8eEhX6BwQHsYB2",
    ],
  },
  {
    id: "ECHG-cxboMQ78Hwlm2-w6OS3iU275bAKkqC1LjwICPyo",
    displayName: "Test MS 3",
    createdAtUTC: "2024-03-07T11:54:56.886Z",
    theme: 0,
    creationStatus: CreationStatus.PENDING,
    s: "4", // Sequence number, only show if s > 0
    dt: "2023-06-12T14:07:53.224866+00:00", // Last key rotation timestamp, if s > 0
    kt: "2", // Keys signing threshold (only show for group identifiers)
    k: [
      // List of signing keys - array
      "DCF6b0c5aVm_26_sCTgLB4An6oUxEM5pVDDLqxxXDxH-",
    ],
    nt: "3", // Next keys signing threshold, only show if nt > 1
    n: [
      // Next keys digests - array
      "EIZ-n_hHHY5ERGTzvpXYBkB6_yBAM4RXcjQG3-JykFvF",
    ],
    bt: "1", // Backer threshold and backer keys below
    b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"], // List of backers
    di: "test", // Delegated identifier prefix, don't show if "",
    groupMemberPre: "ELUXM-ajSu0o1qyFvss-3QQfkj3DOke9aHNwt72Byi9y",
    members: [
      "EFZ-hSogn3-wXEahBbIW_oXYxAV_vH8eEhX6BwQHsYBu",
      "EFZ-hSogn3-wXEahBbIW_oXYxAV_vH8eEhX6BwQHsYB2",
    ],
  },
  {
    id: "ECHG-cxboMQ78Hwlm2-w6OS3iU275bAKkqC1LjwICPyz",
    displayName: "Test MS 4",
    createdAtUTC: "2024-03-07T11:54:56.886Z",
    theme: 0,
    creationStatus: CreationStatus.COMPLETE,
    s: "4", // Sequence number, only show if s > 0
    dt: "2023-06-12T14:07:53.224866+00:00", // Last key rotation timestamp, if s > 0
    kt: "2", // Keys signing threshold (only show for group identifiers)
    k: [
      // List of signing keys - array
      "DCF6b0c5aVm_26_sCTgLB4An6oUxEM5pVDDLqxxXDxH-",
    ],
    nt: "3", // Next keys signing threshold, only show if nt > 1
    n: [
      // Next keys digests - array
      "EIZ-n_hHHY5ERGTzvpXYBkB6_yBAM4RXcjQG3-JykFvF",
    ],
    bt: "1", // Backer threshold and backer keys below
    b: ["BIe_q0F4EkYPEne6jUnSV1exxOYeGf_AMSMvegpF4XQP"], // List of backers
    di: "test", // Delegated identifier prefix, don't show if "",
    groupMemberPre: "ELUXM-ajSu0o1qyFvss-3QQfkj3DOke9aHNwt72Byi9z",
    members: [
      "EFZ-hSogn3-wXEahBbIW_oXYxAV_vH8eEhX6BwQHsYBu",
      "EFZ-hSogn3-wXEahBbIW_oXYxAV_vH8eEhX6BwQHsYB2",
    ],
  },
];

export { identifierFix };
