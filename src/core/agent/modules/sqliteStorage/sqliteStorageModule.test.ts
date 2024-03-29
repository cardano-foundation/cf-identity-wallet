import {
  DependencyManager,
  InjectionSymbols,
  InjectionToken,
} from "@aries-framework/core";
import { SqliteStorageModule } from "./sqliteStorageModule";
import { SqliteStorageService } from "./storage";
import { SqliteStorageWallet } from "./wallet";

jest.mock("./wallet");
jest.mock("./storage");

describe("Sqlite storage module", () => {
  test("registers dependencies on the dependency manager", () => {
    const dependencyManager = {
      registerContextScoped: jest.fn(),
      registerSingleton: jest.fn(),
      isRegistered: jest.fn().mockReturnValue(false),
    } as unknown as DependencyManager;

    const actionMenuModule = new SqliteStorageModule();
    actionMenuModule.register(dependencyManager);

    expect(dependencyManager.registerContextScoped).toBeCalledTimes(1);
    expect(dependencyManager.registerContextScoped).toBeCalledWith(
      InjectionSymbols.Wallet,
      SqliteStorageWallet
    );
    expect(dependencyManager.registerSingleton).toBeCalledTimes(1);
    expect(dependencyManager.registerSingleton).toBeCalledWith(
      InjectionSymbols.StorageService,
      SqliteStorageService
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

    const actionMenuModule = new SqliteStorageModule();
    expect(() => actionMenuModule.register(dependencyManager)).toThrowError(
      SqliteStorageModule.WALLET_ALREADY_REGISTERED_ERROR_MSG
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

    const actionMenuModule = new SqliteStorageModule();
    expect(() => actionMenuModule.register(dependencyManager)).toThrowError(
      SqliteStorageModule.STORAGE_SERVICE_ALREADY_REGISTERED_ERROR_MSG
    );
    expect(dependencyManager.registerContextScoped).toBeCalledTimes(1);
    expect(dependencyManager.registerContextScoped).toBeCalledWith(
      InjectionSymbols.Wallet,
      SqliteStorageWallet
    );
    expect(dependencyManager.registerSingleton).not.toBeCalled();
  });
});
