import { IConfiguration } from "./types";
// eslint-disable-next-line no-undef
const environment = process.env.ENVIRONMENT || "development";

export class ConfigurationService {
  private static configurationEnv: IConfiguration;
  static NOT_FOUND_ENVIRONMENT_FILE =
    "Can not read/cast environment file, please check your configuration";
  async start() {
    await new Promise((rs, rj) => {
      import(`../../../configs/${environment}.yaml`)
        .then((module) => {
          const data = module.default;

          if (this.isIConfiguration(data)) {
            ConfigurationService.configurationEnv = data as IConfiguration;
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

  private isIConfiguration(data: any): boolean {
    return (
      typeof data.keri === "object" &&
      typeof data.keri.witness === "string" &&
      typeof data.keri.pools === "object" &&
      Array.isArray(data.keri.pools) &&
      typeof data.keri.backer.address === "string" &&
      typeof data.keri.backer.aid === "string"
    );
  }
}
