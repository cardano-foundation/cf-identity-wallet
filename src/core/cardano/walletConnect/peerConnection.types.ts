interface ExperimentalAPIFunctions {
  getIdentifierId: () => Promise<string>;
  signData: (identifierId: string, payload: string) => Promise<string>;
  getOobi: (identifierId: string) => Promise<string>;
}

export type { ExperimentalAPIFunctions };
