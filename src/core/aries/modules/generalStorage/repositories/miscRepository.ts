import {
  injectable,
  inject,
  InjectionSymbols,
  Repository,
  EventEmitter,
} from "@aries-framework/core";
import type { StorageService } from "@aries-framework/core";
import { MiscRecord } from "./miscRecord";

enum MiscRecordId {
  OP_PASS_HINT = "app-op-password-hint",
  MEERKAT_PROFILE_KEY = "meerkat-profile"
}

@injectable()
class MiscRepository extends Repository<MiscRecord> {
  constructor(
    @inject(InjectionSymbols.StorageService)
    storageService: StorageService<MiscRecord>,
    eventEmitter: EventEmitter
  ) {
    super(MiscRecord, storageService, eventEmitter);
  }
}

export { MiscRecordId, MiscRepository };
