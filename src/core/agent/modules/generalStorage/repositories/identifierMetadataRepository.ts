import {
  injectable,
  inject,
  InjectionSymbols,
  Repository,
  EventEmitter,
} from "@aries-framework/core";
import type { StorageService } from "@aries-framework/core";
import { IdentifierMetadataRecord } from "./identifierMetadataRecord";

@injectable()
class IdentifierMetadataRepository extends Repository<IdentifierMetadataRecord> {
  constructor(
    @inject(InjectionSymbols.StorageService)
    storageService: StorageService<IdentifierMetadataRecord>,
    eventEmitter: EventEmitter
  ) {
    super(IdentifierMetadataRecord, storageService, eventEmitter);
  }
}

export { IdentifierMetadataRepository };
