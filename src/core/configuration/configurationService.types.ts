interface KeriaConfig {
  url: string;
  bootUrl: string;
}

interface CredentialsConfig {
  testServer: {
    urlInt: string;
  };
}

enum BackingMode {
  POOLS = "pools",
  LEDGER = "ledger",
  DIRECT = "direct",
}

type BackingConfig =
  | {
      mode: BackingMode.DIRECT;
    }
  | {
      mode: BackingMode.POOLS;
      pools: string[];
    }
  | {
      mode: BackingMode.LEDGER;
      ledger: {
        aid: string;
        address: string;
      };
    };

interface Configuration {
  keri: {
    keria: KeriaConfig;
    credentials: CredentialsConfig;
    backing: BackingConfig;
  };
}

export type { Configuration };
export { BackingMode };
