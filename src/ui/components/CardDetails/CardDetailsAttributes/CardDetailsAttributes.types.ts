import {
  JSONObject,
  JSONValue,
} from "../../../../core/agent/services/credentialService.types";
import { CardDetailsItemProps } from "../CardDetailsItem/CardDetailsItem.types";

type ItemProps =
  | Omit<CardDetailsItemProps, "info">
  | ((key?: string) => Omit<CardDetailsItemProps, "info">);

export interface CardDetailsAttributesProps {
  data: JSONObject;
  customType?: string;
  itemProps?: ItemProps;
}

export interface CardDetailsNestedAttributesProps {
  attribute: [string, JSONValue];
  customType?: string;
  cardKeyValue?: string;
  itemProps?: ItemProps;
}
