enum WitnessMode {
  POOLS = "pools",
  BACKER = "backer",
}

interface Configuration {
  keri:
    | {
        witness: WitnessMode.POOLS;
        pools: string[];
      }
    | {
        witness: WitnessMode.BACKER;
        backer: {
          aid: string;
          address: string;
        };
      };
}

export type { Configuration };
export { WitnessMode };
