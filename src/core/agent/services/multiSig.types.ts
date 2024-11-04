import { State } from "signify-ts";

interface CommonExn {
  v: string;
  t: "exn";
  d: string;
  i: string;
  rp: string;
  p: string;
  dt: string;
  r: string;
  q: unknown;
}

interface IcpExn {
  v: string;
  t: string;
  d: string;
  i: string;
  s: string;
  kt: string | string[];
  k: string[];
  nt: string | string[];
  n: string[];
  bt: string;
  b: string[];
  c: string[];
  a: unknown[];
}

interface RotExn {
  v: string;
  t: string;
  d: string;
  i: string;
  s: string;
  kt: string | string[];
  k: string[];
  nt: string | string[];
  n: string[];
  bt: string;
  br: string[];
  ba: string[];
  a: unknown[];
}

interface InceptMultiSigExnMessage {
  exn: CommonExn & {
    a: {
      i: string;
      gid: string;
      smids: string[];
      rmids: string[];
    };
    e: {
      icp: IcpExn;
      d: string;
    };
  };
}

interface RotationMultiSigExnMessage {
  exn: CommonExn & {
    a: {
      i: string;
      gid: string;
      smids: string[];
      rmids: string[];
    };
    e: {
      rot: RotExn;
      d: string;
    };
  };
}

interface CreateMultisigExnPayload {
  gid: string;
  smids: string[];
  rmids: string[];
  rstates: State[];
  name: string;
}

interface AuthorizationExnPayload {
  gid: string;
}

enum MultiSigRoute {
  EXN = "/multisig/exn",
  ICP = "/multisig/icp",
  IXN = "/multisig/ixn",
  RPY = "/multisig/rpy",
  ROT = "/multisig/rot",
}

interface IpexGrantMultiSigExn {
  exn: CommonExn & {
    a: {
      i: string;
      gid: string;
    };
    e: {
      exn: CommonExn & {
        a: {
          i: string;
          m: string;
        };
        e: {
          acdc: unknown; // @TODO - foconnor: We can type these.
          iss: unknown;
          anc: unknown;
          d: string;
        };
      };
      d: string;
    };
  };
}

interface GrantToJoinMultisigExnPayload {
  grantExn: IpexGrantMultiSigExn;
  atc: string;
}

export { MultiSigRoute };

export type {
  RotationMultiSigExnMessage,
  CreateMultisigExnPayload,
  AuthorizationExnPayload,
  GrantToJoinMultisigExnPayload,
  IpexGrantMultiSigExn,
  InceptMultiSigExnMessage,
};
