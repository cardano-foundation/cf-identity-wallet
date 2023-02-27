import { Agent } from '../agent';
import { Key, CreateKeyOptions } from './types';

/**
 * Pluggable secrets interface to manage private keys for an agent - agents may share the same secret manager (e.g. as singleton),
 * but if so caution should be taken for clear separation of keys between agents.
 * 
 * For example, in case the implementation uses BIP-32/44 derivation it is recommended that:
 *  - each agent be assigned an independent account index in the derivation path,
 *  - address indices should not be reused for multiple SupportedKeyTypes.
 */
interface SecretsManager {
  setupAgent(agent: Agent): Promise<void>;
  createKey(agent: Agent, options: CreateKeyOptions): Promise<Key>;
  getBase64SecretById(agent: Agent, id: string): Promise<Key>;
}

export {
  SecretsManager
}
