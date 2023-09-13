import CardanoLogo from "../assets/images/CardanoLogo.jpg";

const connectionsFix = [
  {
    id: "did:example:ebfeb1ebc6f1c276ef71212ec20",
    issuer: "Cambridge University",
    issuanceDate: "2017-08-14T19:23:24Z",
    issuerLogo: CardanoLogo,
    status: "pending",
  },
  {
    id: "did:example:ebfeb1ebc6f1c276ef71212ec21",
    issuer: "Passport Office",
    issuanceDate: "2017-08-16T19:23:24Z",
    issuerLogo: CardanoLogo,
    status: "confirmed",
  },
  {
    id: "did:example:ebfeb1ebc6f1c276ef71212ec22",
    issuer: "Cardano Foundation",
    issuanceDate: "2017-08-13T19:23:24Z",
    issuerLogo: CardanoLogo,
    status: "confirmed",
  },
  {
    id: "did:example:ebfeb1ebc6f1c276ef71212ec23",
    issuer: "DVLA",
    issuanceDate: "2019-05-12T19:23:24Z",
    issuerLogo: CardanoLogo,
    status: "confirmed",
  },
  {
    id: "did:example:ebfeb1ebc6f1c276ef71212ec24",
    issuer: "Starling Bank",
    issuanceDate: "2016-01-10T19:23:24Z",
    issuerLogo: CardanoLogo,
    status: "confirmed",
  },
  {
    id: "did:example:ebfeb1ebc6f1c276ef71212ec25",
    issuer: "Friends' Bank",
    issuanceDate: "2018-01-14T19:23:24Z",
    issuerLogo: CardanoLogo,
    status: "confirmed",
  },
  {
    id: "did:example:ebfeb1ebc6f1c276ef71212ec26",
    issuer: "YMCA",
    issuanceDate: "2020-07-06T19:23:24Z",
    issuerLogo: CardanoLogo,
    status: "confirmed",
  },
];

const connectionRequestPlaceholder = {
  label: "",
  goal_code: "",
  goal: "",
  handshake_protocols: [],
  requestattach: [],
  service: [
    {
      id: "",
      type: "",
      recipientKeys: [],
      routingKeys: [],
      serviceEndpoint: "",
    },
  ],
  profileUrl: "",
  public_did: "",
  type: "",
  id: "",
};

const connectionRequestData = {
  label: "SunCrest Medical",
  goal_code: "connection",
  goal: "Setup passwordless login",
  handshake_protocols: ["did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0"],
  requestattach: [],
  service: [
    {
      id: "8nMzYxqi1nrGXJLpPLNjft;indy",
      type: "IndyAgent",
      recipientKeys: ["5F1SZ9WZusiiD29urKJYJkA6Nc5WggYcXzxjC37edPG3"],
      routingKeys: [
        "5F1SZ9WZusiiD29urKJYJkA6Nc5WggYcXzxjC37edPG3",
        "3mo3P6XzDzBvuktCgDQarACzzeV7zxrSExnicpuH7t83",
      ],
      serviceEndpoint: "https://vas.evernym.com/agency/msg",
    },
  ],
  profileUrl: "https://i.postimg.cc/bvs8K9bJ/Sun-Crest-Medical-logo.png",
  public_did: "did:sov:W2u9PzjDmhKM5xLABjAqav",
  type: "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/out-of-band/1.0/invitation",
  id: "565a1185-9df7-415d-8ab8-fd8e81ad3161",
};

export { connectionsFix, connectionRequestData, connectionRequestPlaceholder };
