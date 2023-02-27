import { BaseRecord } from '../../storage/base-record';
import { JsonObject } from 'json2typescript';

@JsonObject(DidRecord.REPOSITORY_ID)
class DidRecord extends BaseRecord {
  static readonly REPOSITORY_ID = "did";

  constructor() {
    super();
    super.repositoryId = DidRecord.REPOSITORY_ID;
  }
}

export {
  DidRecord
}
