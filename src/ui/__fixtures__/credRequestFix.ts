const credRequestFix = {
  schema: {
    name: "IIW 2024 Demo Day Attendee",
    description:
      "This Trust Over IP (ToIP) Authentic Chained Data Container (ACDC) Credential provides an end-verifiable attestation that the holder attended the Internet Identity Workshop (IIW) on April 16 - 18, 2024, and participated in the Cardano Foundation's Mobile Key Event Receipt Infrastructure (KERI) Wallet demonstration.",
  },
  credentials: [
    {
      connectionId: "EMrT7qX0FIMenQoe5pJLahxz_rheks1uIviGW8ch8pfB",
      acdc: {
        v: "ACDC10JSON000191_",
        d: "EKfweht5lOkjaguB5dz42BMkfejhBFIF9-ghumzCJ6nv",
        i: "EKtDv2h7MNqyhI5iODKtjEQAYWG-tjV5mDzEMf6MW6V0",
        ri: "EANnrMjnnwmII_zt11VA3Y2O4hLqdXRxS1PI18zopFVT",
        s: "EBIFDhtSE0cM4nbTnaMqiV1vUIlcnbsqBMeVMmeGmXOu",
        a: {
          d: "EBZ0TjCqQtxgkcxi_vKE0ppkULOOo_r9KYxTew0RVqLe",
          i: "EG8kbz8r7wI5-zZEF6cq459KNEIIWZR4EyMofehCaUqF",
          dt: "2024-07-16T03:32:59.312000+00:00",
          attendeeName: "hmlax",
        },
      },
    },
    {
      connectionId: "EMrT7qX0FIMenQoe5pJLahxz_rheks1uIviGW8ch8pfB",
      acdc: {
        v: "ACDC10JSON000191_",
        d: "EOT8OgwrwwNnBc-FzHPUBzsFQHOGXfifKqzfT5HwOVyb",
        i: "EKtDv2h7MNqyhI5iODKtjEQAYWG-tjV5mDzEMf6MW6V0",
        ri: "EANnrMjnnwmII_zt11VA3Y2O4hLqdXRxS1PI18zopFVT",
        s: "EBIFDhtSE0cM4nbTnaMqiV1vUIlcnbsqBMeVMmeGmXOu",
        a: {
          d: "ELzvJfDiAyqR8lf466l25AwY7uq_VUN1aBriBIKN7aFM",
          i: "EC_FburiEJzhcSid-XljVAVt1yuWOtALQtmnauaBNFiP",
          dt: "2024-07-16T03:32:51.604000+00:00",
          attendeeName: "hmlax",
        },
      },
    },
  ],
  attributes: {
    attendeeName: "hmlax",
  },
  identifier: "id",
};

export { credRequestFix };
