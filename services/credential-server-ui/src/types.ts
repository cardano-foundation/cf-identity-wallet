export interface Contact {
  id: string;
  alias: string;
  challenges?: string[];
  oobi?: string;
  wellKnown?: string;
}

export interface Credential {
  id: string;
  contactId: string;
}

export interface Data {
  id: string;
  name: string;
  date: string;
  credentials: number;
}
