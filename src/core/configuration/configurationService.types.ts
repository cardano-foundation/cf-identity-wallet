interface KeriaConfig {
  url?: string;
  bootUrl?: string;
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

export type { Configuration };
export { OptionalFeature };
