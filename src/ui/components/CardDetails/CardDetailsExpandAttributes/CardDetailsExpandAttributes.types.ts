import {
  JSONObject,
  JSONValue,
} from "../../../../core/agent/services/credentialService.types";
import { CardDetailsItemProps } from "../CardDetailsItem/CardDetailsItem.types";

export interface CardDetailsExpandAttributesProps {
  data: JSONObject;
  itemProps?: Omit<CardDetailsItemProps, "info">;
  ignoreKeys?: string[];
  openLevels?: number[];
}

export interface CardDetailsAttributeProps {
  attributeKey: string;
  attributeValue: JSONValue;
  customAttributeKey?: string;
  customType?: string;
  itemProps?: Omit<CardDetailsItemProps, "info">;
  deepLevel?: number;
  ignoreKeys?: string[];
  openLevels?: number[];
}
