import {
  AccessConfiguration,
  Configuration,
} from "./configurationService.types";
// eslint-disable-next-line no-undef

const environment = process.env.ENVIRONMENT || "local";
const keriaIP = process.env.KERIA_IP;
const accessConfig = process.env.ACCESS_CONFIG || "";

class ConfigurationService {
  private static configurationEnv: Configuration;
  private static accessConfigEnv: AccessConfiguration;

  static readonly INVALID_ENVIRONMENT_FILE = "Configuration file is invalid: ";
  static readonly NOT_FOUND_ENVIRONMENT_FILE = "Can not read environment file";
  static readonly INVALID_CONFIG_FILE =
    "Access configuration file is invalid: ";
  static readonly NOT_FOUND_CONFIG_FILE = "Can not read config file";

  async start() {
    await new Promise((rs, rj) => {
      import(`../../../configs/${environment}.yaml`)
        .then((module) => {
          const data = module.default;

          const validyCheck = this.configurationValid(data);
          if (validyCheck.success) {
            ConfigurationService.configurationEnv = data as Configuration;
            this.setKeriaIp();
          } else {
            rj(
              new Error(
                ConfigurationService.INVALID_ENVIRONMENT_FILE +
                  validyCheck.reason
              )
            );
          }

          rs(true);
        })
        .catch(() => {
          rj(new Error(ConfigurationService.NOT_FOUND_ENVIRONMENT_FILE));
        });
    });

    this.loadAccessConfigs();
  }

  private async loadAccessConfigs() {
    if (!accessConfig) return;

    await new Promise((rs, rj) => {
      import(`../../../configs/${accessConfig}.json`)
        .then((module) => {
          const data = module.default;

          const validyCheck = this.accessConfigurationValid(data);
          if (validyCheck.success) {
            ConfigurationService.accessConfigEnv = data as AccessConfiguration;
          } else {
            rj(
              new Error(
                ConfigurationService.INVALID_CONFIG_FILE + validyCheck.reason
              )
            );
          }

          rs(true);
        })
        .catch(() => {
          rj(new Error(ConfigurationService.NOT_FOUND_CONFIG_FILE));
        });
    });
  }

  static get env() {
    return this.configurationEnv;
  }

  static get accessConfigs() {
    return this.accessConfigEnv;
  }

  private setKeriaIp() {
    const keriaUrl = ConfigurationService.configurationEnv.keri?.keria?.url;
    const keriaBootUrl =
      ConfigurationService.configurationEnv.keri?.keria?.bootUrl;
    if (keriaIP && ConfigurationService.configurationEnv.keri?.keria?.url) {
      ConfigurationService.configurationEnv.keri.keria.url = keriaUrl?.replace(
        /\/\/[^:]+/,
        `//${keriaIP}`
      );
    }
    if (keriaIP && ConfigurationService.configurationEnv.keri?.keria?.bootUrl) {
      ConfigurationService.configurationEnv.keri.keria.bootUrl =
        keriaBootUrl?.replace(/\/\/[^:]+/, `//${keriaIP}`);
    }
  }

  private configurationValid(
    data: Configuration
  ): { success: true } | { success: false; reason: string } {
    const keri = data.keri;
    if (typeof keri !== "object") {
      return this.invalid("Missing top-level KERI object");
    }

    const security = data.security;
    if (typeof security !== "object" || security === null) {
      return this.invalid("Missing top-level security object");
    }

    const rasp = security.rasp;
    if (typeof rasp !== "object" || rasp === null) {
      return this.invalid("Missing rasp object in security configuration");
    }

    if (typeof rasp.enabled !== "boolean") {
      return this.invalid("rasp.enabled must be a boolean value");
    }

    return { success: true };
  }

  private accessConfigurationValid(
    data: AccessConfiguration
  ): { success: true } | { success: false; reason: string } {
    if (typeof data !== "object") {
      return this.invalid("Missing top-level access config object");
    }

    const keys = Object.keys(data);

    for (const key of keys) {
      if (
        typeof data[key] !== "object" ||
        typeof data[key].active !== "boolean"
      ) {
        return this.invalid(`Invalid config key: ${key}`);
      }
    }

    return { success: true };
  }

  private invalid(reason: string) {
    return { success: false, reason };
  }
}

export { ConfigurationService };
