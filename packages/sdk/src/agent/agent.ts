import { DidManager, KeyHandler, SupportedDidMethod } from '../modules/dids';
import { DidRepository } from '../modules/dids';
import { DidRecord } from '../modules/dids/did-record';
import { CreateKeyOptions, SecretsManager, SupportedKeyType } from '../secrets';
import { BaseRecord, StorageManager } from '../storage';
import { v4 as uuidv4 } from 'uuid';
import { CreateAgentOptions, DerivationKeyContext, AgentContext } from './types';

const DEFAULT_CREATE_AGENT_OPTIONS: CreateAgentOptions = {
  primaryKeyType: SupportedKeyType.Ed25519,
  didMethod: SupportedDidMethod.DidKey
};

class Agent {
  private readonly id: string;

  private readonly primaryKeyType: SupportedKeyType;
  private derivationKeyContext?: DerivationKeyContext;

  private readonly secretsManager: SecretsManager;
  private readonly storageManager: StorageManager<BaseRecord>;
  private readonly didManager: DidManager;
  private readonly didRepository: DidRepository;

  constructor(secretsManager: SecretsManager, storageManager: StorageManager<BaseRecord>, options: CreateAgentOptions = DEFAULT_CREATE_AGENT_OPTIONS) {
    this.id = options.defaultId ? options.defaultId : Buffer.from(uuidv4()).toString("base64");
    this.primaryKeyType = options.primaryKeyType;
    this.secretsManager = secretsManager;
    this.storageManager = storageManager;

    if (options.didMethod === SupportedDidMethod.DidKey) {
      this.didManager = new DidManager(this.secretsManager, new KeyHandler());
    } else {
      throw new Error("No appropriate DID method handler found");
    }

    this.didRepository = new DidRepository(this.storageManager);
    this.secretsManager.setupAgent(this);
  }

  async createDid(createKeyOptions: CreateKeyOptions = {}): Promise<boolean> {
    const result = await this.didManager.create(this, createKeyOptions);
    if (!result.did) {
      return false;
    }

    const record = new DidRecord();
    record.id = result.did;
    await this.didRepository.create(this, record);

    return true;
  }

  getId(): string {
    return this.id;
  }

  setDerivationKeyContext(derivationKeyContext: DerivationKeyContext): void {
    this.derivationKeyContext = derivationKeyContext;
  }

  getDerivationKeyContext(): DerivationKeyContext | undefined {
    return this.derivationKeyContext;
  }

  context(): AgentContext {
    return {
      id: this.id,
      primaryKeyType: this.primaryKeyType,
      ...(this.derivationKeyContext) && { derivationKeyContext: this.derivationKeyContext }
    }
  }
}

export {
  DEFAULT_CREATE_AGENT_OPTIONS,
  Agent
}
