import {
  Module,
  DependencyManager,
  InjectionSymbols,
  AriesFrameworkError,
} from "@aries-framework/core";
import { IonicStorageService } from "./storage";
import { IonicStorageWallet } from "./wallet";

class IonicStorageModule implements Module {
  static readonly WALLET_ALREADY_REGISTERED_ERROR_MSG =
    "There is an instance of Wallet already registered";
  static readonly STORAGE_SERVICE_ALREADY_REGISTERED_ERROR_MSG =
    "There is an instance of StorageService already registered";

  register(dependencyManager: DependencyManager) {
    if (dependencyManager.isRegistered(InjectionSymbols.Wallet)) {
      throw new AriesFrameworkError(
        IonicStorageModule.WALLET_ALREADY_REGISTERED_ERROR_MSG
      );
    } else {
      dependencyManager.registerContextScoped(
        InjectionSymbols.Wallet,
        IonicStorageWallet
      );
    }

    if (dependencyManager.isRegistered(InjectionSymbols.StorageService)) {
      throw new AriesFrameworkError(
        IonicStorageModule.STORAGE_SERVICE_ALREADY_REGISTERED_ERROR_MSG
      );
    } else {
      dependencyManager.registerSingleton(
        InjectionSymbols.StorageService,
        IonicStorageService
      );
    }
  }
}

export { IonicStorageModule };
