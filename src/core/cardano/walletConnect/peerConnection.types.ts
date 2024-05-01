interface ExperimentalAPIFunctions {
  getIdentifierOobi: () => Promise<string>;
  sign: (oobi: string, payload: string) => Promise<string>;
  getOobi: (identifierId: string) => Promise<string>;
}

export type { ExperimentalAPIFunctions };
