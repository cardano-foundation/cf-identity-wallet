import { combineClassNames } from "../../../utils/style";
import { CardDetailsItem } from "../CardDetailsItem";
import { CardDetailsAttributesProps } from "./CardDetailsAttributes.types";
import { reservedKeysFilter } from "./CardDetailsAttributes.utils";
import { CardDetailsNestedAttributes } from "./CardDetailsNestedAttributes";

const CardDetailsAttributes = ({
  data,
  customType,
  itemProps,
}: CardDetailsAttributesProps) => {
  const { className, ...restItemProps } = itemProps || {};
  const attributes = Object.entries(data);

  const itemClass = combineClassNames("card-details-attribute-item", className);

  return (
    <>
      {attributes.map((item, index) => {
        switch (item[0]) {
        case "id": {
          return (
            <CardDetailsItem
              key={index}
              info={item[1] as string}
              copyButton={true}
              className={itemClass}
              testId="card-details-attributes-id"
              {...restItemProps}
            />
          );
        }
        case "d": {
          return;
        }
        default: {
          return typeof item[1] === ("string" || "number") &&
              !customType &&
              !`${item[1]}`.includes(" ") &&
              `${item[1]}`[10] !== "T" ? (
              <CardDetailsItem
                key={index}
                keyValue={`${reservedKeysFilter(item[0])}:`}
                info={item[1] as string}
                copyButton={`${item[1]}`.length > 15}
                testId="card-details-generic-attribute"
                className={itemClass}
                {...restItemProps}
              />
            ) : (
              <CardDetailsNestedAttributes
                key={index}
                attribute={item}
                customType={customType}
                itemProps={itemProps}
              />
            );
        }
        }
      })}
    </>
  );
};

export { CardDetailsAttributes };
