import {
  Module,
  DependencyManager,
  InjectionSymbols,
  AriesFrameworkError,
} from "@aries-framework/core";
import { IonicStorageService } from "./storage";
import { IonicStorageWallet } from "./wallet";

class IonicStorageModule implements Module {
  public register(dependencyManager: DependencyManager) {
    if (dependencyManager.isRegistered(InjectionSymbols.Wallet)) {
      throw new AriesFrameworkError(
        "There is an instance of Wallet already registered"
      );
    } else {
      dependencyManager.registerContextScoped(
        InjectionSymbols.Wallet,
        IonicStorageWallet
      );
    }

    if (dependencyManager.isRegistered(InjectionSymbols.StorageService)) {
      throw new AriesFrameworkError(
        "There is an instance of StorageService already registered"
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
