import { Agent } from "@aries-framework/core";
import { agentModules } from "../agent";
import { BasicStoragesApi } from "../../storage/storage.types";
import { SignifyApi } from "../modules/signify/signifyApi";

abstract class AgentService {
  protected readonly agent: Agent<typeof agentModules>;

  protected readonly basicStorage: BasicStoragesApi;

  protected readonly signifyApi: SignifyApi;

  constructor(
    agent: Agent,
    basicStorage: BasicStoragesApi,
    signifyApi: SignifyApi
  ) {
    this.agent = agent;
    this.basicStorage = basicStorage;
    this.signifyApi = signifyApi;
  }
}

export { AgentService };
