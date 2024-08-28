import { HabState, State } from "signify-ts";

interface InceptMultiSigExnMessage {
  exn: {
    v: string;
    t: string;
    d: string;
    i: string;
    p: string;
    dt: string;
    r: string;
    q: any;
    a: {
      gid: string;
      smids: string[];
      rmids: string[];
      rstates: HabState["state"][];
      name: string;
      i: string;
    };
    e: {
      icp: {
        v: string;
        t: string;
        d: string;
        i: string;
        s: string;
        kt: string;
        k: string[];
        nt: string;
        n: string[];
        bt: string;
        b: string[];
        c: any[];
        a: any[];
      };
      exn: {
        v: string;
        t: string;
        d: string;
        i: string;
        rp: string;
        p: string;
        dt: string;
        r: string;
        q: any;
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

interface GrantToJoinMultisigExnPayload {
  grantExn: InceptMultiSigExnMessage;
  atc: string;
}

export { MultiSigRoute };

export type {
  InceptMultiSigExnMessage,
  CreateMultisigExnPayload,
  AuthorizationExnPayload,
  GrantToJoinMultisigExnPayload,
};
