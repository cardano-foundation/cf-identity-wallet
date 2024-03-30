import { JsonObject, JsonValue } from "@aries-framework/core";

export interface CardDetailsAttributesProps {
  data: JsonObject;
  customType?: string;
}

export interface CardDetailsNestedAttributesProps {
  attribute: [string, JsonValue];
  customType?: string;
  cardKeyValue?: string;
}
