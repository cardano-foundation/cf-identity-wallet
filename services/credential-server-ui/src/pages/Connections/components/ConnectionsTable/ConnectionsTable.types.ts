interface Contact {
  alias: string;
  challenges: string[];
  id: string;
  oobi: string;
  wellKnowns: string[];
}

interface Credential {
  id: string;
  schema: {
    title: string;
  };
  sad: {
    d: string;
  };
}

interface Data {
  id: string;
  name: string;
  date: string;
  credentials: number;
}

export type { Contact, Credential, Data };
