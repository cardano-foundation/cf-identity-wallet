import { HabState, State } from "signify-ts";

interface CommonExn {
  v: string;
  t: string;
  d: string;
  i: string;
  p: string;
  dt: string;
  r: string;
  q: any;
}

interface IcpExn extends CommonExn {
  s: string;
  kt: string | string[];
  k: string[];
  nt: string | string[];
  n: string[];
  bt: string;
  b: string[];
  c: string[];
  a: any[];
}

interface RotExn extends CommonExn {
  s: string;
  kt: string | string[];
  k: string[];
  nt: string | string[];
  n: string[];
  bt: string;
  br: any[];
  ba: any[];
  a: any[];
}

interface InceptMultiSigExnMessage {
  exn: CommonExn & {
    a: {
      gid: string;
      smids: string[];
      rmids: string[];
      rstates: HabState["state"][];
      name: string;
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
      gid: string;
      smids: string[];
      rmids: string[];
      rstates: HabState["state"][];
      name: string;
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
      gid: string;
      i: string;
    };
    e: {
      exn: CommonExn & {
        a: {
          i: string;
          m: string;
        };
        e: {
          acdc: any;
          iss: any;
          anc: any;
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
