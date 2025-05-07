interface KeriaConfig {
  url?: string;
  bootUrl?: string;
}

enum OptionalFeature {
  ConnectWallet = "CONNECT_WALLET",
}

enum CustomContent {
  Intro = "INTRO",
}

enum IndividualOnlyMode {
  FirstCreate = "FirstCreate",
  Alway = "Alway",
}

interface IdentifierConfig {
  creation?: {
    individualOnly?: IndividualOnlyMode;
    defaultName?: string;
  };
}

interface NotificationConfig {
  fallbackIcon: boolean;
}

interface AppFeaturesConfig {
  cut: OptionalFeature[];
  identifiers?: IdentifierConfig;
  customContent: CustomContent[];
  notifications?: NotificationConfig;
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

export type { Configuration };
export { OptionalFeature, CustomContent, IndividualOnlyMode };
