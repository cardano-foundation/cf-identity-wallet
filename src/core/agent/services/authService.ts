import { AgentService } from "./agentService";
import { AgentServicesProps, MiscRecordId } from "../agent.types";
import { Agent } from "../agent";
import { LoginAttempts } from "./auth.types";
import { BasicRecord } from "../records";

class AuthService extends AgentService {
  static readonly MIN_LOCK_TIME = 60 * 1000;

  constructor(agentServiceProps: AgentServicesProps) {
    super(agentServiceProps);
  }

  static readonly LOGIN_ATTEMPT_RECORD_NOT_FOUND =
    "Login attempt record not found";

  async getLoginAttempts() {
    const attemptInfo = await Agent.agent.basicStorage.findById(
      MiscRecordId.LOGIN_METADATA
    );

    if (attemptInfo) {
      return attemptInfo.content as unknown as LoginAttempts;
    }

    await Agent.agent.basicStorage.createOrUpdateBasicRecord(
      new BasicRecord({
        id: MiscRecordId.LOGIN_METADATA,
        content: {
          attempts: 0,
          lockedUntil: Date.now(),
        },
      })
    );

    return {
      attempts: 0,
      lockedUntil: Date.now(),
    };
  }

  async incrementLoginAttempts() {
    const attemptInfo = await Agent.agent.basicStorage.findById(
      MiscRecordId.LOGIN_METADATA
    );

    if (!attemptInfo) {
      throw new Error(AuthService.LOGIN_ATTEMPT_RECORD_NOT_FOUND);
    }

    const content = attemptInfo.content as unknown as LoginAttempts;
    const attempts: number = ++content.attempts;
    let lockedUntil: number = content.lockedUntil;
    let lockDuration = 0;

    switch (attempts) {
    case 5:
      lockDuration = AuthService.MIN_LOCK_TIME;
      break;
    case 6:
      lockDuration = 5 * AuthService.MIN_LOCK_TIME;
      break;
    case 7:
      lockDuration = 10 * AuthService.MIN_LOCK_TIME;
      break;
    case 8:
      lockDuration = 15 * AuthService.MIN_LOCK_TIME;
      break;
    case 9:
      lockDuration = 60 * AuthService.MIN_LOCK_TIME;
      break;
    case 10:
      lockDuration = 4 * 60 * AuthService.MIN_LOCK_TIME;
      break;
    default:
      lockDuration = 8 * 60 * AuthService.MIN_LOCK_TIME;
      break;
    }

    if (attempts >= 5) {
      lockedUntil = Date.now() + lockDuration;
    }

    attemptInfo.content.attempts = attempts;
    attemptInfo.content.lockedUntil = lockedUntil;

    await Agent.agent.basicStorage.update(attemptInfo);
    return { attempts, lockedUntil };
  }

  async resetLoginAttempts() {
    const attemptInfo = await Agent.agent.basicStorage.findById(
      MiscRecordId.LOGIN_METADATA
    );

    if (!attemptInfo) {
      throw new Error(AuthService.LOGIN_ATTEMPT_RECORD_NOT_FOUND);
    }

    attemptInfo.content.attempts = 0;
    attemptInfo.content.lockedUntil = Date.now();

    await Agent.agent.basicStorage.update(attemptInfo);
  }
}

export { AuthService };
