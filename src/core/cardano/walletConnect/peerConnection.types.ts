interface ExperimentalAPIFunctions {
  getIdentifierOobi: (selectedAid: string) => Promise<string>;
  sign: (identifier: string, payload: string) => Promise<string>;
}

export type { ExperimentalAPIFunctions };
