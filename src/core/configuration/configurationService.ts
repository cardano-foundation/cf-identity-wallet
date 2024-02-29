import { Configuration, WitnessMode } from "./configurationService.types";
// eslint-disable-next-line no-undef
const environment = process.env.ENVIRONMENT || "dev-comm";

class ConfigurationService {
  private static configurationEnv: Configuration;
  static NOT_FOUND_ENVIRONMENT_FILE =
    "Can not read/cast environment file, please check your configuration";
  async start() {
    await new Promise((rs, rj) => {
      import(`../../../configs/${environment}.yaml`)
        .then((module) => {
          const data = module.default;

          if (this.configurationValid(data)) {
            ConfigurationService.configurationEnv = data as Configuration;
          } else {
            rj(new Error(ConfigurationService.NOT_FOUND_ENVIRONMENT_FILE));
          }

          rs(true);
        })
        .catch(() => {
          rj(new Error(ConfigurationService.NOT_FOUND_ENVIRONMENT_FILE));
        });
    });
  }

  static get env() {
    return this.configurationEnv;
  }

  private configurationValid(data: Configuration): boolean {
    const keri = data.keri;
    if (typeof keri !== "object") {
      return false;
    }

    const backerType = keri.backerType;
    if (typeof backerType !== "string") {
      return false;
    }

    if (backerType === WitnessMode.POOLS) {
      const witnessConfig = keri.pools;
      return (
        Array.isArray(witnessConfig) &&
        witnessConfig.length > 0 &&
        witnessConfig.every((witness) => typeof witness === "string")
      );
    } else if (backerType === WitnessMode.LEDGER) {
      const ledgerConfig = keri.ledger;
      if (typeof ledgerConfig !== "object") {
        return false;
      }

      return (
        typeof ledgerConfig.aid === "string" &&
        typeof ledgerConfig.address === "string"
      );
    } else {
      return false;
    }
  }
}

export { ConfigurationService };
