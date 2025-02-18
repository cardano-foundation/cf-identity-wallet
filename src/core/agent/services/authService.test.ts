import { ready, Salter } from "signify-ts";
import { CoreEventEmitter } from "../event";
import { MiscRecordId } from "../agent.types";
import { LoginAttempts } from "./auth.types";
import { AuthService } from "./authService";
import { BasicRecord } from "../../agent/records";
import { KeyStoreKeys, SecureStorage } from "../../storage";

jest.mock("../../storage/secureStorage");

const identifiersListMock = jest.fn();
const identifiersGetMock = jest.fn();
const identifiersCreateMock = jest.fn();
const identifiersMemberMock = jest.fn();
const identifiersInteractMock = jest.fn();
const identifiersRotateMock = jest.fn();

const groupGetRequestMock = jest.fn();

const oobiResolveMock = jest.fn();
const queryKeyStateMock = jest.fn();

const signifyClient = jest.mocked({
  connect: jest.fn(),
  boot: jest.fn(),
  identifiers: () => ({
    list: identifiersListMock,
    get: identifiersGetMock,
    create: identifiersCreateMock,
    addEndRole: jest.fn(),
    interact: identifiersInteractMock,
    rotate: identifiersRotateMock,
    members: identifiersMemberMock,
  }),
  operations: () => ({
    get: jest.fn().mockImplementation((id: string) => {
      return {
        done: true,
        response: {
          i: id,
        },
      };
    }),
  }),
  oobis: () => ({
    get: jest.fn(),
    resolve: oobiResolveMock,
  }),
  contacts: () => ({
    list: jest.fn(),
    get: jest.fn().mockImplementation((id: string) => {
      return {
        alias: "e57ee6c2-2efb-4158-878e-ce36639c761f",
        oobi: "oobi",
        id,
      };
    }),
    delete: jest.fn(),
  }),
  notifications: () => ({
    list: jest.fn(),
    mark: jest.fn(),
  }),
  ipex: () => ({
    admit: jest.fn(),
    submitAdmit: jest.fn(),
  }),
  credentials: () => ({
    list: jest.fn(),
  }),
  exchanges: () => ({
    get: jest.fn(),
    send: jest.fn(),
  }),
  agent: {
    pre: "pre",
  },
  keyStates: () => ({
    query: queryKeyStateMock,
    get: jest.fn(),
  }),
  groups: () => ({
    getRequest: groupGetRequestMock,
  }),
});

const agentServicesProps = {
  signifyClient: signifyClient as any,
  eventEmitter: new CoreEventEmitter(),
};

const startTime = new Date();
const existingRecord = new BasicRecord({
  id: MiscRecordId.LOGIN_METADATA,
  content: {
    attempts: 4,
    lockedUntil: Date.now(),
  },
  createdAt: startTime,
});

const basicStorage = jest.mocked({
  open: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
  createOrUpdateBasicRecord: jest.fn(),
});

const authService = new AuthService(agentServicesProps, basicStorage as any);

const PASSCODE = "123456";
const PASSWORD = "test1234";
const HASHED_PASSCODE =
  "0ABdxlN9dAHBzcC8ch-7YegiEGk13YQBfx4BmiPCfHscGK4W4G7UYpRRdbFkLBY9wxT0";
const HASHED_PASSWORD =
  "0ABdxlN9dAHBzcC8ch-7YegiECGdi2G0Anm6zz-61gmL7v6r4FBmb9tgMnw_Acg_6OUB";

describe("Auth service of agent", () => {
  beforeAll(async () => {
    await ready();

    jest
      .spyOn(Salter.prototype, "raw", "get")
      .mockReturnValue(
        new Uint8Array([
          93, 198, 83, 125, 116, 1, 193, 205, 192, 188, 114, 31, 187, 97, 232,
          34,
        ])
      );
    jest
      .spyOn(Salter.prototype, "qb64", "get")
      .mockReturnValue("0ABdxlN9dAHBzcC8ch-7Yegi");
  });

  test("Should return existing login attempts", async () => {
    const existingAttempts: LoginAttempts = {
      attempts: 0,
      lockedUntil: Date.now(),
    };
    basicStorage.findById.mockResolvedValue({
      content: existingAttempts,
    });

    const result = await authService.getLoginAttempts();

    expect(basicStorage.createOrUpdateBasicRecord).toBeCalledTimes(0);
    expect(result.attempts).toBe(0);
    expect(result.lockedUntil).toBeLessThanOrEqual(Date.now());
  });

  test("Should create and return default login attempts if not found", async () => {
    basicStorage.findById.mockResolvedValue(null);

    const result = await authService.getLoginAttempts();

    expect(result.attempts).toBe(0);
    expect(result.lockedUntil).toBeLessThanOrEqual(Date.now());
  });

  test("Should throw an error if login attempt record is not found in incrementLoginAttempts", async () => {
    basicStorage.findById = jest.fn().mockResolvedValue(null);

    await expect(authService.incrementLoginAttempts()).rejects.toThrow(
      AuthService.LOGIN_ATTEMPT_RECORD_NOT_FOUND
    );
  });

  const incrementCases = [
    {
      attempts: 4,
      expectedAttempts: 5,
      lockDuration: AuthService.MIN_LOCK_TIME,
    },
    {
      attempts: 5,
      expectedAttempts: 6,
      lockDuration: 5 * AuthService.MIN_LOCK_TIME,
    },
    {
      attempts: 6,
      expectedAttempts: 7,
      lockDuration: 10 * AuthService.MIN_LOCK_TIME,
    },
    {
      attempts: 7,
      expectedAttempts: 8,
      lockDuration: 15 * AuthService.MIN_LOCK_TIME,
    },
    {
      attempts: 8,
      expectedAttempts: 9,
      lockDuration: 60 * AuthService.MIN_LOCK_TIME,
    },
    {
      attempts: 9,
      expectedAttempts: 10,
      lockDuration: 4 * 60 * AuthService.MIN_LOCK_TIME,
    },
    {
      attempts: 10,
      expectedAttempts: 11,
      lockDuration: 8 * 60 * AuthService.MIN_LOCK_TIME,
    },
    {
      attempts: 11,
      expectedAttempts: 12,
      lockDuration: 8 * 60 * AuthService.MIN_LOCK_TIME,
    },
  ];

  incrementCases.forEach(({ attempts, expectedAttempts, lockDuration }) => {
    test(`Should increment attempts from ${attempts} to ${expectedAttempts} and lock for ${lockDuration} ms`, async () => {
      const lockedUntil = Date.now();
      const existingRecord = new BasicRecord({
        id: MiscRecordId.LOGIN_METADATA,
        content: {
          attempts,
          lockedUntil,
        },
        createdAt: new Date(),
      });

      basicStorage.findById = jest.fn().mockResolvedValue(existingRecord);
      basicStorage.update = jest.fn();

      const result = await authService.incrementLoginAttempts();

      expect(result.attempts).toBe(expectedAttempts);
      if (attempts >= 4) {
        expect(result.lockedUntil).toBeGreaterThan(Date.now());
        expect(result.lockedUntil).toBeLessThanOrEqual(
          Date.now() + lockDuration
        );
      } else {
        expect(result.lockedUntil).toBe(lockedUntil);
      }

      expect(basicStorage.update).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            attempts: expectedAttempts,
            lockedUntil: result.lockedUntil,
          }),
        })
      );
    });
  });

  test("Should reset attempts and lockedUntil", async () => {
    basicStorage.findById = jest.fn().mockResolvedValue(existingRecord);
    basicStorage.update = jest.fn();

    await authService.resetLoginAttempts();

    expect(basicStorage.update).toBeCalled();
  });

  test("Should throw an error if login attempt record is not found in resetLoginAttempts", async () => {
    basicStorage.findById = jest.fn().mockResolvedValue(null);

    await expect(authService.resetLoginAttempts()).rejects.toThrow(
      AuthService.LOGIN_ATTEMPT_RECORD_NOT_FOUND
    );
  });

  test("Should store secret as hashed with a salt", async () => {
    await authService.storeSecret(KeyStoreKeys.APP_PASSCODE, PASSCODE);
    expect(SecureStorage.set).toBeCalledWith(
      KeyStoreKeys.APP_PASSCODE,
      HASHED_PASSCODE
    );

    await authService.storeSecret(KeyStoreKeys.APP_OP_PASSWORD, PASSWORD);
    expect(SecureStorage.set).toBeCalledWith(
      KeyStoreKeys.APP_OP_PASSWORD,
      HASHED_PASSWORD
    );
  });

  test("Cannot verify against missing secret", async () => {
    SecureStorage.get = jest.fn().mockResolvedValue(null);
    await expect(
      authService.verifySecret(KeyStoreKeys.APP_PASSCODE, PASSCODE)
    ).rejects.toThrowError(AuthService.SECRET_NOT_STORED);
  });

  test("Can verify against stored secret", async () => {
    SecureStorage.get = jest.fn().mockImplementation((type: KeyStoreKeys) => {
      return type === KeyStoreKeys.APP_PASSCODE
        ? HASHED_PASSCODE
        : HASHED_PASSWORD;
    });

    expect(
      await authService.verifySecret(KeyStoreKeys.APP_PASSCODE, "111111")
    ).toBe(false);
    expect(
      await authService.verifySecret(KeyStoreKeys.APP_PASSCODE, PASSCODE)
    ).toBe(true);
    expect(
      await authService.verifySecret(KeyStoreKeys.APP_OP_PASSWORD, "wrongpass")
    ).toBe(false);
    expect(
      await authService.verifySecret(KeyStoreKeys.APP_OP_PASSWORD, PASSWORD)
    ).toBe(true);
  });
});
