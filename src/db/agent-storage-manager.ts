
import { Agent, StorageManager, BaseRecord, AgentContext, DEFAULT_CREATE_AGENT_OPTIONS } from '@cf-identity-tools/sdk';
import { secretsManager } from './secrets-manager';
import { get, set, forEach } from './storage';
import { Mutex } from 'async-mutex';
import { JsonConvert } from 'json2typescript';

class AgentStorageManagerImpl<T extends BaseRecord> implements StorageManager<T> {
  static readonly AGENT_DB_KEY_PREFIX = "agent:";
  static readonly AGENT_STORAGE_MANAGER_NOT_INITIALISED = "Agent storage manager has not been initialised";
  static readonly AGENT_CONTEXT_KEY = "context";
  static readonly AGENTS_METADATA_KEY = `agents:metadata`;
  static readonly NEXT_ACCOUNT_INDEX_KEY = "nextAccountIndex";

  private static readonly jsonConverter = new JsonConvert();
  private static readonly accountIndexLock = new Mutex();  // Mutex in case await is forgotten when initialising agents.
  private static nextAccountIndex?: number;
  private rootKeyId?: string;

  async getAgentContext(agentId: string): Promise<AgentContext> {
    const agent = await get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} does not exist`);
    }

    return agent[AgentStorageManagerImpl.AGENT_CONTEXT_KEY];
  }

  async setAgentContext(agentId: string, context: AgentContext): Promise<void> {
    const agentKey = `${AgentStorageManagerImpl.AGENT_DB_KEY_PREFIX}${agentId}`;
    const agent = await get(agentKey);
    if (!agent) {
      throw new Error(`Agent ${agentId} does not exist`);
    }
    agent[AgentStorageManagerImpl.AGENT_CONTEXT_KEY] = context;
    await set(agentKey, agent);
  }
  
  private async getRepositoryJSONById(agent: Agent, repositoryId: string): Promise<T[]> {
    const agentRetrieved = await get(`${AgentStorageManagerImpl.AGENT_DB_KEY_PREFIX}${agent.getId()}`);
    if (!agentRetrieved) {
      throw new Error(`Agent ${agent.getId()} not found.`);
    }
    
    const repository = agentRetrieved[repositoryId];
    if (repository === undefined) {
      throw new Error(`Repository ${repositoryId} was not found for agent ${agent.getId()}.`);
    }
    return repository;
  }

  async getRepositoryById(agent: Agent, repositoryId: string, ClassType: { new (...args: any[]): T; }): Promise<T[]> {
    const repository = await this.getRepositoryJSONById(agent, repositoryId);
    repository.forEach((record: T) => record.repositoryId = repositoryId);
    return AgentStorageManagerImpl.jsonConverter.deserializeArray(repository, ClassType);
  }

  async getRecordById(agent: Agent, repositoryId: string, recordId: string, ClassType: { new (...args: any[]): T; }): Promise<T> {
    const record = (await this.getRepositoryJSONById(agent, repositoryId)).find((record: T) => record.id === recordId);
    if (record === undefined) {
      throw new Error(`Record ${recordId} not found [agent ${agent.getId()}, repository ${repositoryId}]`)
    }
    record.repositoryId = repositoryId;
    return AgentStorageManagerImpl.jsonConverter.deserializeObject(record, ClassType);
  }

  async create(agent: Agent, record: T): Promise<void> {
    const agentKey = `${AgentStorageManagerImpl.AGENT_DB_KEY_PREFIX}${agent.getId()}`;
    let agentObj = await get(agentKey);
    if (!agentObj) {
      throw new Error("Agent is not initialised");
    }

    const recordToStore = AgentStorageManagerImpl.jsonConverter.serialize(record);
    delete recordToStore.repositoryId;  // In our schema this is redundant information, can be added back in before deserialising
    if (agentObj[record.repositoryId]) {
      agentObj[record.repositoryId].push(recordToStore);
    } else {
      agentObj[record.repositoryId] = [recordToStore];
    }

    await set(agentKey, agentObj);
  }

  async update(agent: Agent, record: T): Promise<void> {
    const agentKey = `${AgentStorageManagerImpl.AGENT_DB_KEY_PREFIX}${agent.getId()}`;
    const agentRetrieved = await get(agentKey);
    if (!agentRetrieved) {
      throw new Error(`Agent ${agent.getId()} not found.`);
    }
    
    const repository = agentRetrieved[record.repositoryId];
    if (repository === undefined) {
      throw new Error(`Repository ${record.repositoryId} missing for agent ${agent.getId()}.`);
    }

    const indexToUpdate = repository.findIndex((iRecord: T) => iRecord.id === record.id);
    if (indexToUpdate === -1) {
      throw new Error(`Cannot update ${record.id} [agent ${agent.getId()}, repository ${record.repositoryId}] - record not found.`);
    }

    repository[indexToUpdate] = record;
    await set(agentKey, agentRetrieved);
  }

  async deleteById(agent: Agent, repositoryId: string, id: string): Promise<void> {
    const agentKey = `${AgentStorageManagerImpl.AGENT_DB_KEY_PREFIX}${agent.getId()}`;
    const agentRetrieved = await get(agentKey);
    if (!agentRetrieved) {
      throw new Error(`Agent ${agent.getId()} not found.`);
    }
    
    const repository = agentRetrieved[repositoryId];
    if (repository === undefined) {
      throw new Error(`Repository ${repositoryId} was not found for agent ${agent.getId()}.`);
    }

    let index = repository.findIndex((iRecord: T) => iRecord.id === id);
    if (index === -1) {
      throw new Error(`Cannot remove ${id} [agent ${agent.getId()}, repository ${repositoryId}] - record not found.`);
    }

    repository.splice(index, 1);
    await set(agentKey, agentRetrieved);
  }

  async loadAgentsAndConfig(): Promise<Agent[]> {
    return AgentStorageManagerImpl.accountIndexLock.runExclusive(async () => {
      const agents: Agent[] = [];
      await forEach((value: any, key: string, _iterationNumber: Number) => {
        if (key !== AgentStorageManagerImpl.AGENTS_METADATA_KEY && key.startsWith(AgentStorageManagerImpl.AGENT_DB_KEY_PREFIX)) {
          agents.push(new Agent(secretsManager, this, { ...DEFAULT_CREATE_AGENT_OPTIONS, defaultId: value[AgentStorageManagerImpl.AGENT_CONTEXT_KEY].id }));
        }
      });

      const agentsMetadata = await get(AgentStorageManagerImpl.AGENTS_METADATA_KEY);
      if (agentsMetadata) {
        AgentStorageManagerImpl.nextAccountIndex = agentsMetadata[AgentStorageManagerImpl.NEXT_ACCOUNT_INDEX_KEY];
      } else {
        AgentStorageManagerImpl.nextAccountIndex = 0;
        await set(AgentStorageManagerImpl.AGENTS_METADATA_KEY, { [AgentStorageManagerImpl.NEXT_ACCOUNT_INDEX_KEY]: AgentStorageManagerImpl.nextAccountIndex });
      }

      // @TODO - foconnor: These mnemonics or at least the root mnemonic should be shared and decoupled from a particular crypto wallet
      // For now, this will do.
      const accounts = await get("accounts");
      if (!accounts || !Object.keys(accounts)) {
        throw new Error("Cannot initialise agents until a root phrase has been set");
      }
      this.rootKeyId = accounts[Object.keys(accounts)[0]].id;

      return agents;
    });
  }

  async createAgent(agent: Agent): Promise<void> {
    await AgentStorageManagerImpl.accountIndexLock.runExclusive(async () => {
      if (this.rootKeyId === undefined || AgentStorageManagerImpl.nextAccountIndex === undefined) {
        throw new Error(AgentStorageManagerImpl.AGENT_STORAGE_MANAGER_NOT_INITIALISED);
      }
      
      const agentKey = `${AgentStorageManagerImpl.AGENT_DB_KEY_PREFIX}${agent.getId()}`;
      if (await get(agentKey)) {
        throw new Error("Agent already initialised");
      }
      agent.setDerivationKeyContext({ rootKeyId: this.rootKeyId, accountIndex: AgentStorageManagerImpl.nextAccountIndex, nextKeyIndex: 0 });
    
      AgentStorageManagerImpl.nextAccountIndex++;
      await set(AgentStorageManagerImpl.AGENTS_METADATA_KEY, { [AgentStorageManagerImpl.NEXT_ACCOUNT_INDEX_KEY]: AgentStorageManagerImpl.nextAccountIndex });
      await set(agentKey, { [AgentStorageManagerImpl.AGENT_CONTEXT_KEY]: agent.context() });
    });
  }
}

const agentStorageManager = new AgentStorageManagerImpl();

export {
  agentStorageManager
}
