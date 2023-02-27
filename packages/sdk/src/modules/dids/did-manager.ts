import { DidCreateResult, DidDeactivateResult, DidResolutionResult, DidUpdateResult } from './types';
import { DidMethodHandler } from './did-method-handler';
import { CreateKeyOptions, SecretsManager } from '../../secrets';
import { Agent } from '../../agent';

class DidManager {
  private secretsManager: SecretsManager;
  private didMethodHandler: DidMethodHandler;

  constructor(secretsManager: SecretsManager, didMethodHandler: DidMethodHandler) {
    this.secretsManager = secretsManager;
    this.didMethodHandler = didMethodHandler;
  }

  async create(agent: Agent, options: CreateKeyOptions): Promise<DidCreateResult> {
    return this.didMethodHandler.create(await this.secretsManager.createKey(agent, options));
  }

  async resolve(): Promise<DidResolutionResult> {
    return this.didMethodHandler.resolve();
  }

  async update(): Promise<DidUpdateResult> {
    return this.didMethodHandler.update();
  }

  async deactivate(): Promise<DidDeactivateResult> {
    return this.didMethodHandler.deactivate();
  }
}

export {
  DidManager
}
