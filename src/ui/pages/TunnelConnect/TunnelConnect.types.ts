interface OobiResponse {
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
  b: any[];
  c: any[];
  ee: {
    s: string;
    d: string;
    br: any[];
    ba: any[];
  };
  di: string;
}

interface OobiObject {
  name: string;
  url: string;
  dt: string;
}

interface LocationState {
  oobiUrl?: string;
}

export type { OobiObject, OobiResponse, LocationState };
