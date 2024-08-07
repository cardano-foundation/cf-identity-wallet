interface Aid {
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

interface MultiSigExnMessage {
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

interface CreateMultisigExnPayload {
  gid: string;
  smids: string[];
  rmids: string[];
  rstates: any;
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

export { MultiSigRoute };

export type {
  Aid,
  MultiSigExnMessage,
  CreateMultisigExnPayload,
  AuthorizationExnPayload,
};
