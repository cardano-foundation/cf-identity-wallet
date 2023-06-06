import { AgentConfig, AgentContext, DependencyManager, InjectionSymbols, KeyType, StorageVersionRecord } from "@aries-framework/core";
import { CustomKeyDidRegistrar } from ".";
import { agentDependencies } from "../ariesAgent";
import { IdentityType } from "../ariesAgent.types";
import { IonicStorageWallet } from "../modules/ionicstorage/wallet";
import { CustomKeyDidCreateOptions } from "./customKeyDidRegistrar.types";
import { TestRecord } from "../modules/ionicstorage/storage/testRecord";

const startTime = new Date();

// ------ MOCKS ------
const setMock = jest.fn();
const removeMock = jest.fn();
const getMock = jest.fn().mockImplementation(async (id: string) => {
  if (id === existingRecord.id) {
    return {
      category: existingRecord.type,
      name: existingRecord.id,
      value: JSON.stringify({
        id: "test1",
        testField: "testField1",
        updatedAt: startTime,
      }),
      tags: {},
    };
  } else if (id === storageVersionRecord.id) {
    return {
      category: StorageVersionRecord.name,
      name: storageVersionRecord.id,
      value: JSON.stringify({ id: "storagerecord-0", storageVersion: "0.0.1" }),
      tags: {},
    };
  }
  return undefined;
});
const forEachMock = jest.fn().mockImplementation((fn: () => void) => {
  const items = [
    {
      category: TestRecord.type,
      name: existingRecord.id,
      value: JSON.stringify({
        id: "test-0",
        updatedAt: startTime,
      }),
      tags: { firstTag: "exists", secondTag: "exists" },
    },
    {
      category: StorageVersionRecord.name,
      name: storageVersionRecord.id,
      value: JSON.stringify({ id: "storagerecord-0", storageVersion: "0.0.1" }),
      tags: {},
    },
  ];
  items.forEach(fn);
});
jest.mock("../modules/ionicstorage/wallet", () => ({
  IonicStorageWallet: jest.fn().mockImplementation(() => {
    return {
      store: {
        set: setMock,
        get: getMock,
        remove: removeMock,
        forEach: forEachMock,
      },
    };
  }),
}));
jest.mock("../modules/ionicstorage/storage", () => ({
  ...jest.requireActual("../modules/ionicstorage/storage"),
  assertIonicStorageWallet: jest.fn(),
}));

// ------ TEST OBJECTS ------
const existingRecord = new TestRecord({
  id: "test1",
  testField: "testField1",
  createdAt: startTime,
});
const storageVersionRecord = new StorageVersionRecord({
  id: "storagerecord-0",
  storageVersion: "0.0.1",
});

let agentContext: AgentContext;
let customKeyDidCreateOptions : CustomKeyDidCreateOptions = {
  method: IdentityType.KEY,
  options: {
    keyType: KeyType.Ed25519,
  },
  displayName: "Did Custom Diplay Name Test",
};
const customKeyDidRegistrar = new CustomKeyDidRegistrar();

beforeAll(async () => {
  const walletConfig = {
    id: "ionic-storage-service-test-wallet",
    key: "testkey",
  };
  const agentConfig = new AgentConfig(
    {
      label: "ionic-storage-service-test-agent",
      walletConfig: walletConfig,
    },
    agentDependencies
  );
  const wallet = new IonicStorageWallet();
  const dependencyManager = new DependencyManager();
  dependencyManager.registerInstance(InjectionSymbols.Wallet, wallet);
  dependencyManager.registerInstance(AgentConfig, agentConfig);
  agentContext = new AgentContext({
    dependencyManager,
    contextCorrelationId: "ionic-storage-service-test",
  });
});

describe("TODO", () => {
  test("TODO", async () => {
    await customKeyDidRegistrar.create(agentContext, customKeyDidCreateOptions);
  });

  test("TODO", async () => {
    await customKeyDidRegistrar.update();
  });

  test("TODO", async () => {
    await customKeyDidRegistrar.deactivate();
  });
});