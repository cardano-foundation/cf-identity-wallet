import {
  injectable,
  inject,
  InjectionSymbols,
  Repository,
  EventEmitter,
} from "@aries-framework/core";
import type { StorageService } from "@aries-framework/core";
import { CredentialMetadataRecord } from "./credentialMetadataRecord.types";

@injectable()
class CredentialMetadataRepository extends Repository<CredentialMetadataRecord> {
  constructor(
    @inject(InjectionSymbols.StorageService)
    storageService: StorageService<CredentialMetadataRecord>,
    eventEmitter: EventEmitter
  ) {
    super(CredentialMetadataRecord, storageService, eventEmitter);
  }
}

export { CredentialMetadataRepository };
