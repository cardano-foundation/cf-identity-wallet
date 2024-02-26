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

  private configurationValid(data: any): boolean {
    return (
      (typeof data.keri === "object" &&
        typeof data.keri.witness === "string" &&
        data.keri.witness === WitnessMode.BACKER &&
        typeof data.keri.backer.address === "string" &&
        typeof data.keri.backer.aid === "string") ||
      (data.keri.witness === WitnessMode.POOLS &&
        Array.isArray(data.keri.pools))
    );
  }
}

export { ConfigurationService };
