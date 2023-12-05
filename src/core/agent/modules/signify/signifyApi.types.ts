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
