interface KeriaConfig {
  url?: string;
  bootUrl?: string;
}

interface Configuration {
  keri: {
    keria?: KeriaConfig;
  };
}

export type { Configuration };
