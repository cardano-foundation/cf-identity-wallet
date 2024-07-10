import { AgentService } from "./agentService";
import { AgentServicesProps, MiscRecordId } from "../agent.types";
import { Agent } from "../agent";
import { LoginAttempts } from "./auth.types";
import { BasicRecord } from "../records";

class AuthService extends AgentService {
  static readonly TIME_UNIT = 60 * 1000;

  constructor(agentServiceProps: AgentServicesProps) {
    super(agentServiceProps);
  }

  static readonly LOGIN_ATTEMPT_RECORD_NOT_FOUND =
    "Login attempt record not found";

  async getLoginAttempts() {
    const attemptInfo = await Agent.agent.basicStorage.findById(
      MiscRecordId.LOGIN_ATTEMPT
    );

    if (attemptInfo) {
      return attemptInfo.content as unknown as LoginAttempts;
    } else {
      await Agent.agent.basicStorage.createOrUpdateBasicRecord(
        new BasicRecord({
          id: MiscRecordId.LOGIN_ATTEMPT,
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
  }

  async incrementLoginAttempts() {
    const attemptInfo = await Agent.agent.basicStorage.findById(
      MiscRecordId.LOGIN_ATTEMPT
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
      lockDuration = AuthService.TIME_UNIT;
      break;
    case 6:
      lockDuration = 5 * AuthService.TIME_UNIT;
      break;
    case 7:
      lockDuration = 10 * AuthService.TIME_UNIT;
      break;
    case 8:
      lockDuration = 15 * AuthService.TIME_UNIT;
      break;
    case 9:
      lockDuration = 60 * AuthService.TIME_UNIT;
      break;
    case 10:
      lockDuration = 4 * 60 * AuthService.TIME_UNIT;
      break;
    case 11:
    default:
      lockDuration = 8 * 60 * AuthService.TIME_UNIT;
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
      MiscRecordId.LOGIN_ATTEMPT
    );

    if (!attemptInfo) {
      throw new Error(AuthService.LOGIN_ATTEMPT_RECORD_NOT_FOUND);
    }

    attemptInfo.content.attempts = 0;
    attemptInfo.content.lockedUntil = Date.now();

    await Agent.agent.basicStorage.update(attemptInfo);

    const loginAttempts = await this.getLoginAttempts();
    return loginAttempts;
  }
}

export { AuthService };
