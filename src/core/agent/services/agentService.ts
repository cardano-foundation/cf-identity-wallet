import { Agent } from "@aries-framework/core";
import { agentModules } from "../agent";
import { SignifyApi } from "../modules/signify/signifyApi";
import { StorageApi } from "../../storage/storage.types";

abstract class AgentService {
  protected readonly agent: Agent<typeof agentModules>;

  protected readonly basicStorage: StorageApi;

  protected readonly signifyApi: SignifyApi;

  constructor(agent: Agent, basicStorage: StorageApi, signifyApi: SignifyApi) {
    this.agent = agent;
    this.basicStorage = basicStorage;
    this.signifyApi = signifyApi;
  }
}

export { AgentService };
