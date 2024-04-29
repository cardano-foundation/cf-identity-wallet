import {
  JSONObject,
  JSONValue,
} from "../../../../core/agent/services/credentialService.types";

export interface CardDetailsAttributesProps {
  data: JSONObject;
  customType?: string;
}

export interface CardDetailsNestedAttributesProps {
  attribute: [string, JSONValue];
  customType?: string;
  cardKeyValue?: string;
}
