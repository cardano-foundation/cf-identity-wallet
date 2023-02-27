import { SupportedDidMethod } from '../modules/dids';
import { SupportedKeyType } from '../secrets';

type AgentContext = {
  id: string,
  primaryKeyType: SupportedKeyType
  derivationKeyContext?: DerivationKeyContext
};

type CreateAgentOptions = {
  defaultId?: string,
  primaryKeyType: SupportedKeyType,
  didMethod: SupportedDidMethod
};

type DerivationKeyContext = {
  rootKeyId: string,
  accountIndex: number,
  nextKeyIndex: number
};

export {
  AgentContext,
  CreateAgentOptions,
  DerivationKeyContext
}
