enum WITNESS_MODE {
  POOLS = "pools",
  BACKER = "backer",
}

interface IConfiguration {
  keri: {
    witness: WITNESS_MODE;
    pools: string[];
    backer: {
      aid: string;
      address: string;
    };
  };
}

export type { IConfiguration };
export { WITNESS_MODE };
