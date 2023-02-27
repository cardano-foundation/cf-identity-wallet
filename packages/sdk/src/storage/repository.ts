import { Agent } from '../agent';
import { BaseRecord } from './base-record';
import { StorageManager } from './storage-manager';

/**
 * For a given agent, a repository defines a grouping of item as per Aries RFC 0050.
 * In general, each repository for an agent should use the same storage manager but this is not enforced.
 */
abstract class Repository<T extends BaseRecord> {
  private readonly storageManager: StorageManager<T>;

  constructor(storageManager: StorageManager<T>) {
    this.storageManager = storageManager;
  }

  async create(agent: Agent, record: T): Promise<void> {
    await this.storageManager.create(agent, record);
  }

  async update(agent: Agent, record: T): Promise<void> {
    await this.storageManager.update(agent, record);
  }

  async deleteById(agent: Agent, repositoryId: string, id: string): Promise<void> {
    await this.storageManager.deleteById(agent, repositoryId, id);
  }

  async getById(agent: Agent, record: T): Promise<void> {
    await this.storageManager.create(agent, record);
  }
}

export {
  Repository
}
