import { DependencyManager } from "@aries-framework/core";
import { SignifyApi } from "./signifyApi";
import { SignifyModule } from "./signifyModule";

describe("Signify module", () => {
  test("registers dependencies on the dependency manager", () => {
    const dependencyManager = {
      registerContextScoped: jest.fn(),
    } as unknown as DependencyManager;

    const signifyModule = new SignifyModule();
    signifyModule.register(dependencyManager);

    expect(dependencyManager.registerContextScoped).toBeCalledTimes(1);
    expect(dependencyManager.registerContextScoped).toBeCalledWith(SignifyApi);
  });
});
