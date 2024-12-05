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
        const [key, value] = [...item];

        switch (key) {
        case "id": {
          return (
            <CardDetailsItem
              key={index}
              info={value as string}
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
          return (typeof item[1] === "string" || typeof item[1] === "number") &&
              !customType &&
              !`${value}`.includes(" ") &&
              `${value}`[10] !== "T" ? (
              <CardDetailsItem
                key={index}
                keyValue={`${reservedKeysFilter(key)}:`}
                info={`${value}`}
                copyButton={`${value}`.length > 15}
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
