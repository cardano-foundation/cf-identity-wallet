import { truncate } from "fs";
import { IdentifierMetadataRecord } from "../records/identifierMetadataRecord";
import { EventService } from "./eventService";
import { DelegationService } from "./delegationService";

const identifiersGetMock = jest.fn();
let identifiersCreateMock = jest.fn();
const identifiersInteractMock = jest.fn();

const queryKeyStateMock = jest.fn();

const signifyClient = jest.mocked({
  identifiers: () => ({
    get: identifiersGetMock,
    create: identifiersCreateMock,
    interact: identifiersInteractMock,
  }),
  keyStates: () => ({
    query: queryKeyStateMock,
  }),
});

const identifierStorage = jest.mocked({
  getIdentifierMetadata: jest.fn(),
  getAllIdentifierMetadata: jest.fn(),
  getKeriIdentifiersMetadata: jest.fn(),
  updateIdentifierMetadata: jest.fn(),
  createIdentifierMetadataRecord: jest.fn(),
});

const agentServicesProps = {
  signifyClient: signifyClient as any,
  eventService: new EventService(),
};

const delegationService = new DelegationService(
  agentServicesProps,
  identifierStorage as any
);

describe("Delegation sig service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("should call signify.createDelegationIdentifier with the correct parameters and return the result", async () => {
    const aid = "newIdentifierAid";
    const displayName = "newDisplayName";
    const signifyName = "newUuidHere";
    identifiersCreateMock = jest.fn().mockResolvedValue({
      identifier: aid,
      signifyName,
      serder: {
        ked: {
          i: "i",
        },
      },
    });
    expect(
      await delegationService.createDelegatedIdentifier(
        {
          displayName,
          theme: 0,
        },
        "delegationPrefix"
      )
    ).toEqual({
      identifier: "i",
      signifyName: expect.any(String),
    });
    expect(identifiersCreateMock).toBeCalled();
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledTimes(1);
  });

  test("should call the interactDelegation method of the signify module with the given arguments", async () => {
    const signifyName = "exampleSignifyName";
    const delegatePrefix = "exampleDelegatePrefix";
    identifiersInteractMock.mockResolvedValue({
      op: jest.fn().mockResolvedValue({
        done: truncate,
      }),
    });
    await delegationService.approveDelegation(signifyName, delegatePrefix);
    expect(identifiersInteractMock).toHaveBeenCalledWith(signifyName, {
      d: delegatePrefix,
      i: delegatePrefix,
      s: "0",
    });
  });
  test("should call signify.checkDelegationSuccess and update metadata isPending property to false", async () => {
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      isPending: true,
      signifyOpName: "op123",
      signifyName: "john_doe",
      theme: 0,
    } as IdentifierMetadataRecord;
    identifiersGetMock.mockResolvedValue({
      state: {
        id: metadata.id,
      },
    });
    queryKeyStateMock.mockResolvedValue({
      done: true,
    });
    expect(await delegationService.checkDelegationSuccess(metadata)).toEqual(
      true
    );
    expect(identifierStorage.updateIdentifierMetadata).toHaveBeenCalledWith(
      metadata.id,
      { isPending: false }
    );
  });
  test("should call signify.checkDelegationSuccess with isPending is false and return true", async () => {
    const metadata = {
      id: "123456",
      displayName: "John Doe",

      isPending: false,
      signifyOpName: "op123",
      signifyName: "john_doe",
      theme: 0,
    } as IdentifierMetadataRecord;
    expect(await delegationService.checkDelegationSuccess(metadata)).toEqual(
      true
    );
  });
});
