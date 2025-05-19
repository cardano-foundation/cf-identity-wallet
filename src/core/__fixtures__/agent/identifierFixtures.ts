import {
  IdentifierMetadataRecord,
  IdentifierMetadataRecordProps,
} from "../../agent/records";

const now = new Date();

const individualRecordProps: IdentifierMetadataRecordProps = {
  id: "EGrdtLIlSIQHF1gHhE7UVfs9yRF-EDhqtLT41pJlj_p9",
  displayName: "Identifier 2",
  createdAt: now,
  theme: 0,
};

const individualRecord = new IdentifierMetadataRecord(individualRecordProps);

const hab = {
  name: "Alice",
  prefix: "EBsX58cp09dyBfsS6xQ8O-p67HYQR4zYQLPfT9ht8swD",
  salty: {
    sxlt: "1AAH6zRgnjBT3f_Dp5bW2GV3h01mZEXsgCd5v1h2zn4HXiQu1nidjbrvSN5MSor_-MrmJ5x9IC9A5S5rg3JcJ49ZCa1c1BnGnf3s",
    pidx: 0,
    kidx: 0,
    stem: "signify:aid",
    tier: "low",
    dcode: "E",
    icodes: ["A"],
    ncodes: ["A"],
    transferable: true,
  },
  transferable: true,
  state: {
    vn: [1, 0],
    i: "EBsX58cp09dyBfsS6xQ8O-p67HYQR4zYQLPfT9ht8swD",
    s: "0",
    p: "",
    d: "EBsX58cp09dyBfsS6xQ8O-p67HYQR4zYQLPfT9ht8swD",
    f: "0",
    dt: "2024-08-09T08:57:09.153532+00:00",
    et: "icp",
    kt: "1",
    k: ["DG3hEoRU0xAAXeQyIp-4ZjSDek4Th3Nwu8JEf8i0OwUV"],
    nt: "1",
    n: ["EDc8hJDL15LfjaAT8WsUnEcx3e0Hz59ge4Uf6krmRIK1"],
    bt: "3",
    b: [
      "BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2Ha",
      "BLskRTInXnMxWaGqcpSyMgo0nYbalW99cGZESrz3zapM",
      "BIKKuvBwpmDVA4Ds-EpL5bt9OqPzWPja2LigFYZN2YfX",
    ],
    c: [],
    ee: {
      s: "0",
      d: "EBsX58cp09dyBfsS6xQ8O-p67HYQR4zYQLPfT9ht8swD",
      br: [],
      ba: [],
    },
    di: "",
  },
  windexes: [0, 1, 2],
};

const remoteSignReqExn = {
  exn: {
    v: "KERI10JSON000120_",
    t: "exn",
    d: "EMAFpQQYEoGVtNP6jTijgeap3UQB5LoY3U3FlyCdAsTE",
    i: "EFogYHoLZHsUo8N9lZzMySTGTs7o6UnrWH3W7M1X3KoV",
    rp: "EBsX58cp09dyBfsS6xQ8O-p67HYQR4zYQLPfT9ht8swD",
    p: "",
    dt: "2025-05-01T12:38:26.736000+00:00",
    r: "/remotesign/ixn/req",
    q: {},
    a: {
      d: "EIAARCAUQMQrjqMTp6D0Pk3UuOUrrIS8uKC1bvJRpWyJ",
      t: 2,
    },
    e: {},
  },
  pathed: {},
};

const remoteSignRefExn = {
  exn: {
    v: "KERI10JSON00014f_",
    t: "exn",
    d: "EFj2jDFQIDasdAnw3kREIaZERvBbSYpBC5V6uDtV4ZW8",
    i: "EBud2J12fTqj8IboUn2KH4uHxCAcFM8iPNYVoIlqizNa",
    rp: "EFogYHoLZHsUo8N9lZzMySTGTs7o6UnrWH3W7M1X3KoV",
    p: "EA3F4IAPPrmTtLm3b3Xhk3TdLWFThuZbzQAExSl7hnBX",
    dt: "2025-05-01T11:33:20.276000+00:00",
    r: "/remotesign/ixn/ref",
    q: {},
    a: {
      sn: "3",
    },
    e: {},
  },
  pathed: {},
};

export { individualRecord, hab, remoteSignReqExn, remoteSignRefExn };
