import {
  Module,
  DependencyManager,
  InjectionSymbols,
  AriesFrameworkError,
} from "@aries-framework/core";
import { SqliteStorageService } from "./storage";
import { SqliteStorageWallet } from "./wallet";

class SqliteStorageModule implements Module {
  static readonly WALLET_ALREADY_REGISTERED_ERROR_MSG =
    "There is an instance of Wallet already registered";
  static readonly STORAGE_SERVICE_ALREADY_REGISTERED_ERROR_MSG =
    "There is an instance of StorageService already registered";

  register(dependencyManager: DependencyManager) {
    if (dependencyManager.isRegistered(InjectionSymbols.Wallet)) {
      throw new AriesFrameworkError(
        SqliteStorageModule.WALLET_ALREADY_REGISTERED_ERROR_MSG
      );
    } else {
      dependencyManager.registerContextScoped(
        InjectionSymbols.Wallet,
        SqliteStorageWallet
      );
    }

    if (dependencyManager.isRegistered(InjectionSymbols.StorageService)) {
      throw new AriesFrameworkError(
        SqliteStorageModule.STORAGE_SERVICE_ALREADY_REGISTERED_ERROR_MSG
      );
    } else {
      dependencyManager.registerSingleton(
        InjectionSymbols.StorageService,
        SqliteStorageService
      );
    }
  }
}

export { SqliteStorageModule as SqliteStorageModule };
