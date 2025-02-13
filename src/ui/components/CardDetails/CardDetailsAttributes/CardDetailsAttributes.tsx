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
  const attributes = Object.entries(data);

  return (
    <>
      {attributes.map((item, index) => {
        const { className, ...restItemProps } =
          typeof itemProps === "function"
            ? itemProps(item[0])
            : itemProps || {};
        const itemClass = combineClassNames(
          "card-details-attribute-item",
          className
        );

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
            return (typeof item[1] === "string" ||
              typeof item[1] === "number") &&
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
