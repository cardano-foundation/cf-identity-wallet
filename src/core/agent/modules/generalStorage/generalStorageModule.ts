import { Module, DependencyManager } from "@aries-framework/core";
import { GeneralStorageApi } from "./generalStorageApi";

class GeneralStorageModule implements Module {
  readonly api = GeneralStorageApi;

  register(dependencyManager: DependencyManager) {
    dependencyManager.registerContextScoped(GeneralStorageApi);
  }
}

export { GeneralStorageModule };
