import {
  injectable,
  inject,
  InjectionSymbols,
  Repository,
  EventEmitter,
} from "@aries-framework/core";
import type { StorageService } from "@aries-framework/core";
import { CryptoAccountRecord } from "./cryptoAccountRecord";

enum CryptoAccountRecordId {
}

@injectable()
class CryptoAccountRepository extends Repository<CryptoAccountRecord> {
  constructor(
    @inject(InjectionSymbols.StorageService)
    storageService: StorageService<CryptoAccountRecord>,
    eventEmitter: EventEmitter
  ) {
    super(CryptoAccountRecord, storageService, eventEmitter);
  }
}

export { CryptoAccountRecordId, CryptoAccountRepository };
