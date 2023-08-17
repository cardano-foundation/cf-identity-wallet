import {
  DependencyManager,
  InjectionSymbols,
  InjectionToken,
} from "@aries-framework/core";
import { IonicStorageModule } from "./ionicStorageModule";
import { IonicStorageService } from "./storage";
import { IonicStorageWallet } from "./wallet";

describe("Ionic storage module", () => {
  test("registers dependencies on the dependency manager", () => {
    const dependencyManager = {
      registerContextScoped: jest.fn(),
      registerSingleton: jest.fn(),
      isRegistered: jest.fn().mockReturnValue(false),
    } as unknown as DependencyManager;

    const ionicStorageModule = new IonicStorageModule();
    ionicStorageModule.register(dependencyManager);

    expect(dependencyManager.registerContextScoped).toBeCalledTimes(1);
    expect(dependencyManager.registerContextScoped).toBeCalledWith(
      InjectionSymbols.Wallet,
      IonicStorageWallet
    );
    expect(dependencyManager.registerSingleton).toBeCalledTimes(1);
    expect(dependencyManager.registerSingleton).toBeCalledWith(
      InjectionSymbols.StorageService,
      IonicStorageService
    );
  });

  test("should throw if a wallet has already been registered", () => {
    const dependencyManager = {
      registerContextScoped: jest.fn(),
      registerSingleton: jest.fn(),
      isRegistered: jest
        .fn()
        .mockImplementation((token: InjectionToken<unknown>) => {
          return token === InjectionSymbols.Wallet;
        }),
    } as unknown as DependencyManager;

    const ionicStorageModule = new IonicStorageModule();
    expect(() => ionicStorageModule.register(dependencyManager)).toThrowError(
      IonicStorageModule.WALLET_ALREADY_REGISTERED_ERROR_MSG
    );
    expect(dependencyManager.registerContextScoped).not.toBeCalled();
    expect(dependencyManager.registerSingleton).not.toBeCalled();
  });

  test("should throw if a storage service has already been registered", () => {
    const dependencyManager = {
      registerContextScoped: jest.fn(),
      registerSingleton: jest.fn(),
      isRegistered: jest
        .fn()
        .mockImplementation((token: InjectionToken<unknown>) => {
          return token === InjectionSymbols.StorageService;
        }),
    } as unknown as DependencyManager;

    const ionicStorageModule = new IonicStorageModule();
    expect(() => ionicStorageModule.register(dependencyManager)).toThrowError(
      IonicStorageModule.STORAGE_SERVICE_ALREADY_REGISTERED_ERROR_MSG
    );
    expect(dependencyManager.registerContextScoped).toBeCalledTimes(1);
    expect(dependencyManager.registerContextScoped).toBeCalledWith(
      InjectionSymbols.Wallet,
      IonicStorageWallet
    );
    expect(dependencyManager.registerSingleton).not.toBeCalled();
  });
});
