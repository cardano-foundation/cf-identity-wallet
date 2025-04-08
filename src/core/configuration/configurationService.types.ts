interface KeriaConfig {
  url?: string;
  bootUrl?: string;
}

interface AccessConfiguration {
  [key: string]: {
    active: boolean;
  };
}

enum OptionalFeature {
  ConnectWallet = "CONNECT_WALLET",
}

interface Configuration {
  keri: {
    keria?: KeriaConfig;
  };
  security: {
    rasp: {
      enabled: boolean;
    };
  };
  features: {
    cut: OptionalFeature[];
  };
}

export type { Configuration, AccessConfiguration };
export { OptionalFeature };
