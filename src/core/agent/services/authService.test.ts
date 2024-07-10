import { EventService } from "./eventService";
import { MiscRecordId } from "../agent.types";
import { LoginAttempts } from "./auth.types";
import { AuthService } from "./authService";
import { BasicRecord } from "../../agent/records";
import { Agent } from "../agent";

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
  eventService: new EventService(),
};

const startTime = new Date();
const existingRecord = new BasicRecord({
  id: MiscRecordId.LOGIN_ATTEMPT,
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

const authService = new AuthService(agentServicesProps);

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      basicStorage: {
        findById: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        createOrUpdateBasicRecord: jest.fn(),
      },
    },
  },
}));

describe("Auth service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
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
    { attempts: 4, expectedAttempts: 5, lockDuration: AuthService.TIME_UNIT },
    {
      attempts: 5,
      expectedAttempts: 6,
      lockDuration: 5 * AuthService.TIME_UNIT,
    },
    {
      attempts: 6,
      expectedAttempts: 7,
      lockDuration: 10 * AuthService.TIME_UNIT,
    },
    {
      attempts: 7,
      expectedAttempts: 8,
      lockDuration: 15 * AuthService.TIME_UNIT,
    },
    {
      attempts: 8,
      expectedAttempts: 9,
      lockDuration: 60 * AuthService.TIME_UNIT,
    },
    {
      attempts: 9,
      expectedAttempts: 10,
      lockDuration: 4 * 60 * AuthService.TIME_UNIT,
    },
    {
      attempts: 10,
      expectedAttempts: 11,
      lockDuration: 8 * 60 * AuthService.TIME_UNIT,
    },
    {
      attempts: 11,
      expectedAttempts: 12,
      lockDuration: 8 * 60 * AuthService.TIME_UNIT,
    },
  ];

  incrementCases.forEach(({ attempts, expectedAttempts, lockDuration }) => {
    test(`Should increment attempts from ${attempts} to ${expectedAttempts} and lock for ${lockDuration} ms`, async () => {
      const lockedUntil = Date.now();
      const existingRecord = new BasicRecord({
        id: MiscRecordId.LOGIN_ATTEMPT,
        content: {
          attempts,
          lockedUntil,
        },
        createdAt: new Date(),
      });

      Agent.agent.basicStorage.findById = jest
        .fn()
        .mockResolvedValue(existingRecord);
      Agent.agent.basicStorage.update = jest.fn();

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

      expect(Agent.agent.basicStorage.update).toHaveBeenCalledWith(
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
    Agent.agent.basicStorage.findById = jest
      .fn()
      .mockResolvedValue(existingRecord);
    Agent.agent.basicStorage.update = jest.fn();

    const result = await authService.resetLoginAttempts();

    expect(Agent.agent.basicStorage.update).toBeCalled();
  });
});
