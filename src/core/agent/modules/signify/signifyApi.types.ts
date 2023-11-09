export interface ICreateIdentifierResult {
  signifyName: string;
  identifier: string;
}

export interface IContact {
  alias: string;
  id: string;
  oobi: string;
  challenges: Array<string>;
  wellKnowns: Array<string>;
}
