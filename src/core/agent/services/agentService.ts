import { SignifyApi } from "../modules/signify/signifyApi";
import { BasicStoragesApi } from "../../storage/storage.types";
import { EventService } from "./eventService";

abstract class AgentService {
  protected readonly basicStorage: BasicStoragesApi;

  protected readonly signifyApi: SignifyApi;

  protected readonly eventService: EventService;

  constructor(basicStorage: BasicStoragesApi, signifyApi: SignifyApi) {
    this.basicStorage = basicStorage;
    this.signifyApi = signifyApi;
    this.eventService = new EventService();
  }
}

export { AgentService };
