interface KeriaConfig {
  url?: string;
  bootUrl?: string;
}

enum OptionalFeature {
  ConnectWallet = "CONNECT_WALLET",
}

enum IndividualOnlyMode {
  FirstTime = "FirstTime",
  Always = "Always",
}

interface IdentifierConfig {
  creation?: {
    individualOnly?: IndividualOnlyMode;
    defaultName?: string;
  };
}

interface AppFeaturesConfig {
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
  features: AppFeaturesConfig;
}

export { IndividualOnlyMode, OptionalFeature };
export type { Configuration };
