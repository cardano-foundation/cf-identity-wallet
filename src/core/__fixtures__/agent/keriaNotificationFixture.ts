import { ExchangeRoute, NotificationRoute } from "../../agent/agent.types";
import { CredentialStatus } from "../../agent/services/credentialService.types";

const credentialMetadataMock = {
  type: "CredentialMetadataRecord",
  id: "EJuFvMGiT3uhEXtd7UQlkAm4N_MymeHfhkgnOgPhK0cJ",
  isArchived: false,
  isDeleted: false,
  createdAt: "2024-08-09T04:21:18.311Z",
  issuanceDate: "2024-08-09T04:21:12.575Z",
  credentialType: "Qualified vLEI Issuer Credential",
  status: CredentialStatus.CONFIRMED,
  connectionId: "EP0fEaRWZDR7caQbdserTOWlC_4trvqB1tzbr2xVo3a4",
  schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  updatedAt: "2024-08-09T04:21:19.695Z",
};

const grantForIssuanceExnMessage = {
  exn: {
    v: "KERI10JSON000516_",
    t: "exn",
    d: "EJ1jbI8vTFCEloTfSsZkBpV0bUJnhGVyak5q-5IFIglL",
    i: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
    p: "",
    dt: "2024-07-30T04:19:55.801000+00:00",
    r: ExchangeRoute.IpexGrant,
    q: {},
    a: {
      m: "",
      i: "EE-gjeEni5eCdpFlBtG7s4wkv7LJ0JmWplCS4DNQwW2G",
      gid: "gid",
    },
    e: {
      acdc: {
        d: "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W",
        i: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
        s: "EBIFDhtSE0cM4nbTnaMqiV1vUIlcnbsqBMeVMmeGmXOu",
        a: {
          d: "ELHCh_X2aw7C-aYesOM4La23a5lsoNuJDuCsJuxwO2nq",
          i: "EE-gjeEni5eCdpFlBtG7s4wkv7LJ0JmWplCS4DNQwW2G",
          dt: "2024-07-30T04:19:55.348000+00:00",
          attendeeName: "ccc",
        },
      },
      iss: {
        t: "iss",
        d: "EHStOgwJku_Ln-YN2ohgWUH-CI07SyJnFppSbF8kG4PO",
        i: "EEqfWy-6jx_FG0RNuNxZBh_jq6Lq1OPuvX5m3v1Bzxdn",
        s: "0",
        dt: "2024-07-30T04:19:55.348000+00:00",
      },
      d: "EKBPPnWxYw2I5CtQSyhyn5VUdSTJ61qF_-h-NwmFRkIF",
    },
  },
  pathed: {
    acdc: "-IABEEqfWy-6jx_FG0RNuNxZBh_jq6Lq1OPuvX5m3v1Bzxdn0AAAAAAAAAAAAAAAAAAAAAAAEHStOgwJku_Ln-YN2ohgWUH-CI07SyJnFppSbF8kG4PO",
    iss: "-VAS-GAB0AAAAAAAAAAAAAAAAAAAAAAAEEO0xKzC8FOAXV-JgFZGgb0aIT2A3cPXPt9_0l_qcGM9",
    anc: "-AABAACBlQqbI_qNpKYkzIog6tauSgt0XufBvGtrumfbnhSInFjSwnaIqZi353QT-c1W_gE9KIz3rgX5QNNWLcqA7bcM",
  },
};

const applyForPresentingExnMessage = {
  exn: {
    v: "KERI10JSON000198_",
    t: "exn",
    d: "EFbd-N8VoWbHzpwPUKm4hPF6ZKCRNHfnYiKKYDT7N0KS",
    i: "EB7p1BiY_BJKHqnYbZCnBA7R7gx5LN5RSw5lvxugNkTE",
    rp: "EFPQ7LAydMjiYYxPzvTcNs9rqzj5Khb8fNtAli9DraQK",
    p: "",
    dt: "2024-09-12T09:42:43.794000+00:00",
    r: ExchangeRoute.IpexApply,
    q: {},
    a: {
      i: "EFPQ7LAydMjiYYxPzvTcNs9rqzj5Khb8fNtAli9DraQK",
      m: "",
      s: "EJxnJdxkHbRw2wVFNe4IUOPLt8fEtg9Sr3WyTjlgKoIb",
      a: { attendeeName: "4" },
    },
    e: {},
  },
  pathed: {},
};

const agreeForPresentingExnMessage = {
  exn: {
    v: "KERI10JSON000516_",
    t: "exn",
    d: "EJ1jbI8vTFCEloTfSsZkBpV0bUJnhGVyak5q-5IFIglL",
    i: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
    p: "",
    dt: "2024-07-30T04:19:55.801000+00:00",
    r: ExchangeRoute.IpexAgree,
    q: {},
    a: { m: "", i: "EE-gjeEni5eCdpFlBtG7s4wkv7LJ0JmWplCS4DNQwW2G" },
    e: {
      acdc: {
        d: "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W",
        i: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
        s: "EBIFDhtSE0cM4nbTnaMqiV1vUIlcnbsqBMeVMmeGmXOu",
        a: {
          d: "ELHCh_X2aw7C-aYesOM4La23a5lsoNuJDuCsJuxwO2nq",
          i: "EE-gjeEni5eCdpFlBtG7s4wkv7LJ0JmWplCS4DNQwW2G",
          dt: "2024-07-30T04:19:55.348000+00:00",
          attendeeName: "ccc",
        },
      },
      iss: {
        t: "iss",
        d: "EHStOgwJku_Ln-YN2ohgWUH-CI07SyJnFppSbF8kG4PO",
        i: "EEqfWy-6jx_FG0RNuNxZBh_jq6Lq1OPuvX5m3v1Bzxdn",
        s: "0",
        dt: "2024-07-30T04:19:55.348000+00:00",
      },
      d: "EKBPPnWxYw2I5CtQSyhyn5VUdSTJ61qF_-h-NwmFRkIF",
    },
  },
  pathed: {
    acdc: "-IABEEqfWy-6jx_FG0RNuNxZBh_jq6Lq1OPuvX5m3v1Bzxdn0AAAAAAAAAAAAAAAAAAAAAAAEHStOgwJku_Ln-YN2ohgWUH-CI07SyJnFppSbF8kG4PO",
    iss: "-VAS-GAB0AAAAAAAAAAAAAAAAAAAAAAAEEO0xKzC8FOAXV-JgFZGgb0aIT2A3cPXPt9_0l_qcGM9",
    anc: "-AABAACBlQqbI_qNpKYkzIog6tauSgt0XufBvGtrumfbnhSInFjSwnaIqZi353QT-c1W_gE9KIz3rgX5QNNWLcqA7bcM",
  },
};

const getCredentialResponse = {
  sad: {
    a: { LEI: "5493001KJTIIGC8Y1R17" },
    d: "EBEWfIUOn789yJiNRnvKqpbWE3-m6fSDxtu6wggybbli",
    i: "EIpeOFh268oRJTM4vNNoQvMWw-NBUPDv1NqYbx6Lc1Mk",
    ri: "EOIj7V-rqu_Q9aGSmPfviBceEtRk1UZBN5H2P_L-Hhx5",
    s: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
    v: "ACDC10JSON000197_",
  },
  schema: {
    title: "Qualified vLEI Issuer Credential",
    description: "vLEI Issuer Description",
    version: "1.0.0",
    credentialType: "QualifiedvLEIIssuervLEICredential",
  },
  status: {
    s: "0",
    dt: new Date().toISOString(),
  },
};

const multisigExnAdmitForIssuance = {
  exn: {
    v: "KERI10JSON00032d_",
    t: "exn",
    d: "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO",
    i: "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
    rp: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
    p: "",
    dt: "2024-08-28T06:39:55.501000+00:00",
    r: NotificationRoute.MultiSigExn,
    q: {},
    a: {
      i: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
      gid: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
    },
    e: {
      exn: {
        v: "KERI10JSON000178_",
        t: "exn",
        d: "EKa94ERqArLOvNf9AmItMJtsoGKZPVb3e_pEo_1D37qt",
        i: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
        rp: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
        p: "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W",
        dt: "2024-08-28T06:39:51.416000+00:00",
        r: ExchangeRoute.IpexAdmit,
        q: {},
        a: {
          i: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
          m: "",
        },
        e: {},
      },
      d: "EE8_Xc0ZUh_sUJLtmBpVSEr-RFS2mRUIpFyL-pmvtPvx",
    },
  },
  pathed: {},
};

const multisigExnOfferForPresenting = {
  exn: {
    v: "KERI10JSON00032d_",
    t: "exn",
    d: "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO",
    i: "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
    rp: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
    p: "",
    dt: "2024-08-28T06:39:55.501000+00:00",
    r: NotificationRoute.MultiSigExn,
    q: {},
    a: {
      i: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
      gid: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
    },
    e: {
      exn: {
        v: "KERI10JSON000178_",
        t: "exn",
        d: "EKa94ERqArLOvNf9AmItMJtsoGKZPVb3e_pEo_1D37qt",
        i: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
        rp: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
        p: "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W",
        dt: "2024-08-28T06:39:51.416000+00:00",
        r: ExchangeRoute.IpexOffer,
        q: {},
        a: {
          i: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
          m: "",
        },
        e: { acdc: { d: "EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT" } },
      },
      d: "EE8_Xc0ZUh_sUJLtmBpVSEr-RFS2mRUIpFyL-pmvtPvx",
    },
  },
  pathed: {},
};

const multisigExnApplyForPresenting = {
  exn: {
    e: {
      exn: {
        p: "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W",
        r: ExchangeRoute.IpexApply,
      },
      d: "EE8_Xc0ZUh_sUJLtmBpVSEr-RFS2mRUIpFyL-pmvtPsvx",
    },
  },
  pathed: {},
};

const multisigExnGrant = {
  exn: {
    v: "KERI10JSON00032d_",
    t: "exn",
    d: "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO",
    i: "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
    rp: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
    p: "",
    dt: "2024-08-28T06:39:55.501000+00:00",
    r: NotificationRoute.MultiSigExn,
    q: {},
    a: {
      i: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
      gid: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
    },
    e: {
      exn: {
        v: "KERI10JSON000178_",
        t: "exn",
        d: "EKa94ERqArLOvNf9AmItMJtsoGKZPVb3e_pEo_1D37qt",
        i: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
        rp: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
        p: "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W",
        dt: "2024-08-28T06:39:51.416000+00:00",
        r: ExchangeRoute.IpexGrant,
        q: {},
        a: {
          i: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
          m: "",
        },
        e: {
          acdc: { d: "EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT" },
        },
      },
      d: "EE8_Xc0ZUh_sUJLtmBpVSEr-RFS2mRUIpFyL-pmvtPvx",
    },
  },
  pathed: {},
};

const notificationMultisigRpyProp = {
  i: "string",
  dt: "string",
  r: false,
  a: {
    r: NotificationRoute.MultiSigRpy,
    d: "string",
    m: "",
  },
};

const notificationMultisigExnProp = {
  i: "string",
  dt: "string",
  r: false,
  a: {
    r: NotificationRoute.MultiSigExn,
    d: "string",
    m: "",
  },
};

const notificationMultisigIcpProp = {
  i: "string",
  dt: "string",
  r: false,
  a: {
    r: NotificationRoute.MultiSigIcp,
    d: "string",
    m: "",
  },
};

const notificationIpexGrantProp = {
  i: "string",
  dt: "string",
  r: false,
  a: {
    r: NotificationRoute.ExnIpexGrant,
    d: "string",
    m: "",
  },
};

const notificationIpexAgreeProp = {
  i: "string",
  dt: "string",
  r: false,
  a: {
    r: NotificationRoute.ExnIpexAgree,
    d: "string",
    m: "",
  },
};

const notificationIpexApplyProp = {
  i: "string",
  dt: "string",
  r: false,
  a: {
    r: NotificationRoute.ExnIpexApply,
    d: "string",
    m: "",
  },
};

const credentialStateIssued = {
  vn: [1, 0],
  i: "EJd6GsxIhMXj1M8Ie0mq7oLgCcoEqp2p0YJIoh6wGa6M",
  s: "0",
  d: "EEFWKiBAQWh4RK2l_M8SxMZcPPsTaCG1-hIgl5Ve7Vy0",
  ri: "EEewa3h_r6kU-VW9RC-CvP6-ZBXhXQzzBQIMnI1_-_GX",
  ra: {},
  a: {
    s: 18,
    d: "EHQp2tuAj4RygtixT0QsYUtP6YW5L_yzPThBMwmaARlC",
  },
  dt: "2024-11-07T08:32:34.943000+00:00",
  et: "iss",
};

const notificationIpexOfferProp = {
  i: "string",
  dt: "string",
  r: false,
  a: {
    r: NotificationRoute.ExnIpexOffer,
    d: "string",
    m: "",
  },
};

export {
  credentialMetadataMock,
  grantForIssuanceExnMessage,
  applyForPresentingExnMessage,
  agreeForPresentingExnMessage,
  multisigExnAdmitForIssuance,
  multisigExnOfferForPresenting,
  multisigExnApplyForPresenting,
  multisigExnGrant,
  getCredentialResponse,
  notificationMultisigRpyProp,
  notificationMultisigExnProp,
  notificationMultisigIcpProp,
  notificationIpexGrantProp,
  notificationIpexAgreeProp,
  notificationIpexApplyProp,
  credentialStateIssued,
  notificationIpexOfferProp,
};
