interface KeriaConfig {
  url?: string;
  bootUrl?: string;
}

interface CredentialsConfig {
  testServer: {
    urlInt: string;
  };
}

interface Configuration {
  keri: {
    keria?: KeriaConfig;
    credentials: CredentialsConfig;
  };
}

export type { Configuration };
