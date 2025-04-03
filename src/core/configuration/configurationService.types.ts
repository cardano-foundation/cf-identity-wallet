interface KeriaConfig {
  url?: string;
  bootUrl?: string;
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
}

interface AccessConfiguration {
  [key: string]: {
    active: boolean;
  };
}

export type { Configuration, AccessConfiguration };
