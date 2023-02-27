import { Agent, AgentContext } from '../agent';
import { BaseRecord } from './base-record';

/**
 * Pluggable storage interface as per Aries RFC 0050.
 */
interface StorageManager<T extends BaseRecord> {
  getAgentContext(agentId: string): Promise<AgentContext>;
  setAgentContext(agentId: string, context: AgentContext): Promise<void>;

  getRepositoryById(agent: Agent, repositoryId: string, ClassType: { new (...args: any[]): T; }): Promise<T[]>;
  getRecordById(agent: Agent, repositoryId: string, recordId: string, ClassType: { new (...args: any[]): T; }): Promise<T>;

  create(agent: Agent, record: T): Promise<void>;
  update(agent: Agent, record: T): Promise<void>;
  deleteById(agent: Agent, repositoryId: string, id: string): Promise<void>;
}

export {
  StorageManager
}
