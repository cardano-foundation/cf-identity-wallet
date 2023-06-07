import {
  AgentConfig,
  AgentContext,
  DependencyManager,
  DidDocumentRole,
  DidRepository,
  InjectionSymbols,
  JsonTransformer,
  Key,
  KeyType,
  TypedArrayEncoder,
} from "@aries-framework/core";
import { CustomKeyDidRegistrar } from ".";
import { agentDependencies } from "../ariesAgent";
import { IdentityType } from "../ariesAgent.types";
import { IonicStorageWallet } from "../modules/ionicstorage/wallet";
import { CustomKeyDidCreateOptions } from "./customKeyDidRegistrar.types";

// ------ MOCKS ------
const customKey = Key.fromPublicKey(
  TypedArrayEncoder.fromBase58("BaLQbiee3X8VUAz4gQ66Na7sZKaedJbEiuxq699nUSUc"),
  KeyType.Ed25519
);
jest.mock("../modules/ionicstorage/wallet", () => ({
  IonicStorageWallet: jest.fn().mockImplementation(() => {
    return {
      createKey: jest.fn().mockResolvedValue(customKey),
    };
  }),
}));
const saveDidRepositoryMock = jest.fn();
const didRepositoryMock = {
  save: saveDidRepositoryMock,
};

// ------ TEST OBJECTS ------
let agentContext: AgentContext;
let customKeyDidCreateOptions: CustomKeyDidCreateOptions = {
  method: IdentityType.KEY,
  options: {
    keyType: KeyType.Ed25519,
  },
  displayName: "Did Custom Display Name Test",
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
  dependencyManager.registerInstance(
    DidRepository,
    didRepositoryMock as unknown as DidRepository
  );
  agentContext = new AgentContext({
    dependencyManager,
    contextCorrelationId: "ionic-storage-service-test",
  });
});

describe("CustomKeyDidRegistrar", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should create a did:key using a Ed25519 key type", async () => {
    const result = await customKeyDidRegistrar.create(
      agentContext,
      customKeyDidCreateOptions
    );

    expect(JsonTransformer.toJSON(result)).toMatchObject({
      didDocumentMetadata: {},
      didRegistrationMetadata: {},
      didState: {
        state: "finished",
        did: "did:key:z6Mkq2bTBxu5P4cxafpmMy3wDffsNtrW3BqbQvskvR7oPfFz",
        didDocument: {
          id: "did:key:z6Mkq2bTBxu5P4cxafpmMy3wDffsNtrW3BqbQvskvR7oPfFz",
        },
      },
    });

    expect(agentContext.wallet.createKey).toHaveBeenCalledWith({
      keyType: "ed25519",
    });
  });

  test("should store the created did", async () => {
    const did = "did:key:z6Mkq2bTBxu5P4cxafpmMy3wDffsNtrW3BqbQvskvR7oPfFz";

    await customKeyDidRegistrar.create(agentContext, customKeyDidCreateOptions);

    expect(didRepositoryMock.save).toHaveBeenCalledTimes(1);
    const didRecord = didRepositoryMock.save.mock.calls[0][1];
    
    expect(didRecord).toMatchObject({
      did,
      type: 'DidRecord',
      _tags: { displayName: customKeyDidCreateOptions.displayName },
      role: DidDocumentRole.Created,
      didDocument: undefined,
    })
  });

  test("should return an error state when calling update", async () => {
    const result = await customKeyDidRegistrar.update();

    expect(result).toEqual({
      didDocumentMetadata: {},
      didRegistrationMetadata: {},
      didState: {
        state: "failed",
        reason: `notSupported: cannot update did:key did`,
      },
    });
  });

  test("should return an error state when calling deactivate", async () => {
    const result = await customKeyDidRegistrar.deactivate();

    expect(result).toEqual({
      didDocumentMetadata: {},
      didRegistrationMetadata: {},
      didState: {
        state: "failed",
        reason: `notSupported: cannot deactivate did:key did`,
      },
    });
  });
});
