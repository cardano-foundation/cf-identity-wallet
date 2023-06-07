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
import { LabelledKeyDidRegistrar } from ".";
import { agentDependencies } from "../ariesAgent";
import { IdentityType } from "../ariesAgent.types";
import { IonicStorageWallet } from "../modules/ionicstorage/wallet";
import { LabelledKeyDidCreateOptions } from "./labelledKeyDidRegistrar.types";

const did = "did:key:z6Mkq2bTBxu5P4cxafpmMy3wDffsNtrW3BqbQvskvR7oPfFz";
const customKeyEd25519Base58 = "BaLQbiee3X8VUAz4gQ66Na7sZKaedJbEiuxq699nUSUc";
const keyAgreementPublicKeyBase58 =
  "CuLYDoUXJ7xLzsDibMQcyqButyxjBCcgcbhEWb6gMAUR";

// ------ MOCKS ------
const labelledKey = Key.fromPublicKey(
  TypedArrayEncoder.fromBase58(customKeyEd25519Base58),
  KeyType.Ed25519
);
jest.mock("../modules/ionicstorage/wallet", () => ({
  IonicStorageWallet: jest.fn().mockImplementation(() => {
    return {
      createKey: jest.fn().mockResolvedValue(labelledKey),
    };
  }),
}));
const saveDidRepositoryMock = jest.fn();
const didRepositoryMock = {
  save: saveDidRepositoryMock,
};

// ------ TEST OBJECTS ------
let agentContext: AgentContext;
let labelledKeyDidCreateOptions: LabelledKeyDidCreateOptions = {
  method: IdentityType.KEY,
  options: {
    keyType: KeyType.Ed25519,
  },
  displayName: "Did Labelled Display Name Test",
};
const labelledKeyDidRegistrar = new LabelledKeyDidRegistrar();

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

describe("LabelledKeyDidRegistrar", () => {
  test("should create a did:key using a Ed25519 key type", async () => {
    const result = await labelledKeyDidRegistrar.create(
      agentContext,
      labelledKeyDidCreateOptions
    );

    expect(didRepositoryMock.save).toBeCalledWith(agentContext, {
      _tags: { displayName: labelledKeyDidCreateOptions.displayName },
      type: "DidRecord",
      metadata: { data: {} },
      id: expect.any(String),
      did: did,
      role: "created",
      createdAt: expect.any(Date),
    });

    expect(JsonTransformer.toJSON(result)).toMatchObject({
      didDocumentMetadata: {
        didRegistrationMetadata: {},
        didState: {
          state: "finished",
          did: did,
          didDocument: {
            id: did,
            verificationMethod: [
              {
                type: "Ed25519VerificationKey2018",
                publicKeyBase58: customKeyEd25519Base58,
              },
            ],
            keyAgreement: [
              {
                type: "X25519KeyAgreementKey2019",
                publicKeyBase58: keyAgreementPublicKeyBase58,
              },
            ],
          },
        },
      },
    });

    expect(agentContext.wallet.createKey).toHaveBeenCalledWith({
      keyType: "ed25519",
    });
  });

  test("should return an error state when calling update", async () => {
    const result = await labelledKeyDidRegistrar.update();

    expect(didRepositoryMock.save).not.toBeCalled();

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
    const result = await labelledKeyDidRegistrar.deactivate();

    expect(didRepositoryMock.save).not.toBeCalled();

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
