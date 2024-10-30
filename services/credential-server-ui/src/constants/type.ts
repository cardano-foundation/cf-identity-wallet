export interface IAttributes {
  [key: string]: string;
}

export interface IAttributeObj {
  defaultValue: any;
  type: any;
  key: string;
  label: string;
  value?: string;
}

export interface SchemaShortDetails {
  $id: string;
  title: string;
}

export interface OptionalField {
  name: string;
  description: string;
  type: string;
  customizable: boolean;
  default?: string | number;
  fields?: OptionalField[];
}
