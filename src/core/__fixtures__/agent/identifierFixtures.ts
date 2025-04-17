import {
  IdentifierMetadataRecord,
  IdentifierMetadataRecordProps,
} from "../../agent/records";

const now = new Date();

const individualRecordProps: IdentifierMetadataRecordProps = {
  id: "EGrdtLIlSIQHF1gHhE7UVfs9yRF-EDhqtLT41pJlj_p9",
  displayName: "Identifier 2",
  createdAt: now,
  theme: 0,
};

const individualRecord = new IdentifierMetadataRecord(individualRecordProps);

export { individualRecord };
