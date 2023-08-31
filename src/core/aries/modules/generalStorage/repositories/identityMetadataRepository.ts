import {
  injectable,
  inject,
  InjectionSymbols,
  Repository,
  EventEmitter,
} from "@aries-framework/core";
import type { StorageService } from "@aries-framework/core";
import { IdentityMetadataRecord } from "./identityMetadataRecord";

@injectable()
class IdentityMetadataRepository extends Repository<IdentityMetadataRecord> {
  constructor(
    @inject(InjectionSymbols.StorageService)
    storageService: StorageService<IdentityMetadataRecord>,
    eventEmitter: EventEmitter
  ) {
    super(IdentityMetadataRecord, storageService, eventEmitter);
  }
}

export { IdentityMetadataRepository };
