interface KeriaConfig {
  url?: string;
  bootUrl?: string;
}

enum OptionalFeature {
  ConnectWallet = "CONNECT_WALLET",
  SelectIdentifierType = "SELECT_IDENTIFIER_TYPE",
}

interface IdentifierFeature {
  prefillName: string;
}
interface Feature {
  cut: OptionalFeature[];
  identifier?: IdentifierFeature;
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
