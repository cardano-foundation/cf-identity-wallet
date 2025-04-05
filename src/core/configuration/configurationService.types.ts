interface KeriaConfig {
  url?: string;
  bootUrl?: string;
}

interface AccessConfiguration {
  [key: string]: {
    active: boolean;
  };
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
  accessPermission: AccessConfiguration;
}

export type { Configuration, AccessConfiguration };
