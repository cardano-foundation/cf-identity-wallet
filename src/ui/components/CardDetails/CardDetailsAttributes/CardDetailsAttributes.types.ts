export interface CardDetailsAttributesProps {
  data: any; //TODO - bao-sotatek: Will replace with type in another PR
  customType?: string;
}

export interface CardDetailsNestedAttributesProps {
  attribute: [string, any];
  customType?: string;
  cardKeyValue?: string;
}
