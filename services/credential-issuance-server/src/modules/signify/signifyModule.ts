import { Module, DependencyManager } from "@aries-framework/core";
import { SignifyApi } from "./signifyApi";

class SignifyModule implements Module {
  readonly api = SignifyApi;

  register(dependencyManager: DependencyManager) {
    dependencyManager.registerContextScoped(SignifyApi);
  }
}

export { SignifyModule };
