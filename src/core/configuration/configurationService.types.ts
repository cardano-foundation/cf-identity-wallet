interface KeriaConfig {
  url?: string;
  bootUrl?: string;
}

enum OptionalFeature {
  ConnectWallet = "CONNECT_WALLET",
}

interface IdentifierConfig {
  creation?: {
    individualOnly?: boolean;
    defaultName?: string;
  };
}

interface Feature {
  cut: OptionalFeature[];
  identifiers?: IdentifierConfig;
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
  features: Feature;
}

export type { Configuration };
export { OptionalFeature };
