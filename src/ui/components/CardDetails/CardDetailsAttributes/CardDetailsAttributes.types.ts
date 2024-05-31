import {
  JSONObject,
  JSONValue,
} from "../../../../core/agent/services/credentialService.types";
import { CardDetailsItemProps } from "../CardDetailsItem/CardDetailsItem.types";

export interface CardDetailsAttributesProps {
  data: JSONObject;
  customType?: string;
  itemProps?: Omit<CardDetailsItemProps, "info">;
}

export interface CardDetailsNestedAttributesProps {
  attribute: [string, JSONValue];
  customType?: string;
  cardKeyValue?: string;
}
