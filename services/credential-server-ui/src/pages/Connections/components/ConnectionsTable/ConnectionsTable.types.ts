interface Contact {
  alias: string;
  challenges: string[];
  id: string;
  oobi: string;
  createdAt: string;
  wellKnowns: string[];
}

interface Credential {
  contactId: string;
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
  date: number;
  credentials: number;
}

export type { Contact, Credential, Data };
