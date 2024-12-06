import { useMemo } from "react";
import { formatShortDate, formatTimeToSec } from "../../../utils/formatters";
import { CardDetailsItem } from "../CardDetailsItem";
import { CardDetailsNestedAttributesProps } from "./CardDetailsAttributes.types";
import { reservedKeysFilter } from "./CardDetailsAttributes.utils";
import "./CardDetailsAttributes.scss";
import { CardDetailsBlock } from "../CardDetailsBlock";
import { combineClassNames } from "../../../utils/style";

const CardDetailsNestedAttributes = ({
  attribute,
  cardKeyValue,
  itemProps,
}: CardDetailsNestedAttributesProps) => {
  const { className, ...restItemProps } = itemProps || {};
  const key = attribute[0];
  const item = attribute[1] as any;
  const dateRegex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3,6}([+-]\d{2}:\d{2}|Z)$/;

  const cardDetailInfo = useMemo(() => {
    if (dateRegex.test(item))
      return `${formatShortDate(item)} - ${formatTimeToSec(item)}`;

    const isValuedType = typeof item === ("string" || "number");

    if (isValuedType) return item;

    return "";
  }, []);

  const isObjectItem = typeof item === "object" && item !== null;
  const detailItemsClass = combineClassNames(
    "card-details-attribute-item",
    className,
    {
      "has-nested-item": isObjectItem,
    }
  );

  const infoTestId = dateRegex.test(item) ? "cred-detail-time" : undefined;
  const innerCardKeyValue = cardKeyValue || `${reservedKeysFilter(key)}:`;

  return (
    <>
      <CardDetailsItem
        keyValue={innerCardKeyValue}
        info={cardDetailInfo}
        infoTestId={infoTestId}
        className={detailItemsClass}
        mask={false}
        {...restItemProps}
      />
      {isObjectItem && (
        <CardDetailsBlock className="card-details-nested-content">
          {Object.entries(item).map((sub: any, i: number) => {
            return (
              <CardDetailsNestedAttributes
                key={i}
                cardKeyValue={sub[0].replace(/([a-z])([A-Z])/g, "$1 $2") + ":"}
                attribute={sub}
                itemProps={itemProps}
              />
            );
          })}
        </CardDetailsBlock>
      )}
    </>
  );
};

export { CardDetailsNestedAttributes };
