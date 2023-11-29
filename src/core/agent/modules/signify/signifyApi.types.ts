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
