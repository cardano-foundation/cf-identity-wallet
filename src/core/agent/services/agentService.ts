import { SignifyApi } from "../modules/signify/signifyApi";
import { StorageApi } from "../../storage/storage.types";
import { EventService } from "./eventService";

abstract class AgentService {
  protected readonly basicStorage: StorageApi;

  protected readonly signifyApi: SignifyApi;

  protected readonly eventService: EventService;

  constructor(basicStorage: StorageApi, signifyApi: SignifyApi) {
    this.basicStorage = basicStorage;
    this.signifyApi = signifyApi;
    this.eventService = new EventService();
  }
}

export { AgentService };
