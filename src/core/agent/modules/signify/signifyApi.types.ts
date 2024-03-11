export interface CreateIdentifierResult {
  signifyName: string;
  identifier: string;
}

export interface KeriContact {
  alias: string;
  id: string;
  oobi: string;
  challenges: Array<string>;
  wellKnowns: Array<string>;
}

export interface IdentifierResult {
  name: string;
  prefix: string;
  salty: any;
}

export interface IdentifiersListResult {
  aids: IdentifierResult[];
  start: 0;
  end: 0;
  total: 0;
}

export interface CreateMultisigExnPayload {
  gid: string;
  smids: any[];
  rmids: any;
  rstates: any;
  name: string;
}

export interface Aid {
  name: string;
  prefix: string;
  salty: any;
  transferable: boolean;
  state: {
    vn: number[];
    i: string;
    s: string;
    p: string;
    d: string;
    f: string;
    dt: string;
    et: string;
    kt: string;
    k: string[];
    nt: string;
    n: string[];
    bt: string;
    b: string[];
    c: string[];
    ee: {
      s: string;
      d: string;
      br: any[];
      ba: any[];
    };
    di: string;
  };
  windexes: number[];
}

export interface MultiSigIcpNotification {
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
      rstates: Aid["state"][];
      name: string;
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
      d: string;
    };
  };
}

export enum NotificationRoute {
  Credential = "/exn/ipex/grant",
  MultiSigIcp = "/multisig/icp",
  MultiSigRot = "/multisig/rot",
  ExnIpexApply = "/exn/ipex/apply",
  ExnIpexAgree = "/exn/ipex/agree",
}

export enum MultiSigRoute {
  ROT = "/multisig/rot",
  ICP = "/multisig/icp",
  IXN = "/multisig/ixn",
}
