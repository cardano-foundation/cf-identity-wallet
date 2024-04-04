export interface DidKeyJson {
  id: string;
  method: string;
  displayName: string;
  createdAtUTC: string;
  colors: string[];
  theme: number;
  controller: string;
  keyType: string;
  publicKeyBase58: string;
  isPending: boolean;
}

export interface KeriJson {
  id: string;
  method: string;
  displayName: string;
  createdAtUTC: string;
  signifyName: string;
  colors: string[];
  theme: number;
  isPending: boolean;
  s: string;
  dt: string;
  kt: string;
  k: string[];
  nt: string;
  n: string[];
  bt: string;
  b: string[];
  di: string;
}
