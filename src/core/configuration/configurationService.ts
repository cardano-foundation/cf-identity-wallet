import { Configuration, BackingMode } from "./configurationService.types";
// eslint-disable-next-line no-undef
const environment = process.env.ENVIRONMENT || "local-comm";
const keriaIP = process.env.KERIA_IP;
class ConfigurationService {
  private static configurationEnv: Configuration;

  static readonly INVALID_ENVIRONMENT_FILE = "Configuration file is invalid: ";
  static readonly NOT_FOUND_ENVIRONMENT_FILE = "Can not read environment file";

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
  }

  static get env() {
    return this.configurationEnv;
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

    // CREDENTIALS config
    if (typeof keri.credentials !== "object") {
      return this.invalid("Missing credentials config");
    }

    if (typeof keri.credentials.testServer !== "object") {
      return this.invalid("Missing credential issuance test server config");
    }

    if (typeof keri.credentials.testServer.urlInt !== "string") {
      return this.invalid(
        "Invalid credential issuance test server config (urlInt)"
      );
    }

    // BACKING config
    if (typeof keri.backing !== "object") {
      return this.invalid("Missing backing configuration object");
    }

    const backerMode = keri.backing.mode;
    if (typeof backerMode !== "string") {
      return this.invalid("Missing backer type");
    }

    if (backerMode === BackingMode.POOLS) {
      const witnessConfig = keri.backing.pools;
      const witnessConfigValid =
        Array.isArray(witnessConfig) &&
        witnessConfig.length > 0 &&
        witnessConfig.every((witness) => typeof witness === "string");
      return witnessConfigValid
        ? { success: true }
        : this.invalid("Invalid witness config format");
    } else if (backerMode === BackingMode.LEDGER) {
      const ledgerConfig = keri.backing.ledger;
      if (typeof ledgerConfig !== "object") {
        return this.invalid("Ledger config must be an object");
      }

      const ledgerConfigValid =
        typeof ledgerConfig.aid === "string" &&
        typeof ledgerConfig.address === "string";
      return ledgerConfigValid
        ? { success: true }
        : this.invalid("Ledger config is not valid");
    } else if (backerMode === BackingMode.DIRECT) {
      return { success: true };
    }
    return this.invalid("Invalid backer mode");
  }

  private invalid(reason: string) {
    return { success: false, reason };
  }
}

export { ConfigurationService };
