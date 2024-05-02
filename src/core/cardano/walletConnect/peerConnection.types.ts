interface ExperimentalAPIFunctions {
  getIdentifierOobi: () => Promise<string>;
  sign: (identifier: string, payload: string) => Promise<string>;
}

export type { ExperimentalAPIFunctions };
