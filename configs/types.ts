enum WITNESS_MODE {
  POOLS = "pools",
  BACKER = "backer",
}

type EnvironmentType = {
  keri: {
    witness: WITNESS_MODE;
    pools: string[];
    backer: {
      aid: string;
      address: string;
    };
  };
};

export type { EnvironmentType };
export { WITNESS_MODE };
