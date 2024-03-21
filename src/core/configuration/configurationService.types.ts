enum WitnessMode {
  POOLS = "pools",
  LEDGER = "ledger",
}

interface Configuration {
  keri:
    | {
        backerType: WitnessMode.POOLS;
        pools: string[];
      }
    | {
        backerType: WitnessMode.LEDGER;
        ledger: {
          aid: string;
          address: string;
        };
      };
}

export type { Configuration };
export { WitnessMode };
