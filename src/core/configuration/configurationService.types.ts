import { SwiperOptions } from "swiper/types";

interface KeriaConfig {
  url?: string;
  bootUrl?: string;
}

enum OptionalFeature {
  ConnectWallet = "CONNECT_WALLET",
}

interface CustomContent {
  introScreen: string;
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
    customContent?: CustomContent;
  };
}

export type { Configuration };
export { OptionalFeature };
