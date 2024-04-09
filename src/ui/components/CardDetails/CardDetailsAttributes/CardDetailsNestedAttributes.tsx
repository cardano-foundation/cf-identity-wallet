import { useMemo } from "react";
import { i18n } from "../../../../i18n";
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
  customType,
}: CardDetailsNestedAttributesProps) => {
  const key = attribute[0];
  const item = attribute[1] as any;

  const cardDetailInfo = useMemo(() => {
    if (item[10] === "T")
      return `${formatShortDate(item)} - ${formatTimeToSec(item)}`;

    const isValuedType = typeof item === ("string" || "number");
    if (isValuedType && customType === "status")
      return item === "0"
        ? i18n.t("credentials.details.status.issued")
        : i18n.t("credentials.details.status.revoked");

    if (isValuedType) return item;

    return "";
  }, []);

  const isObjectItem = typeof item === "object" && item !== null;
  const detailItemsClass = combineClassNames("card-details-attribute-item", {
    "has-nested-item": isObjectItem,
  });

  const infoTestId = item[10] === "T" ? "cred-detail-time" : undefined;
  const innerCardKeyValue =
    cardKeyValue || `${reservedKeysFilter(key, customType)}:`;

  return (
    <>
      <CardDetailsItem
        keyValue={innerCardKeyValue}
        info={cardDetailInfo}
        infoTestId={infoTestId}
        className={detailItemsClass}
        mask={false}
      />
      {isObjectItem && (
        <CardDetailsBlock className="card-details-nested-content">
          {Object.entries(item).map((sub: any, i: number) => {
            return (
              <CardDetailsNestedAttributes
                key={i}
                cardKeyValue={sub[0].replace(/([a-z])([A-Z])/g, "$1 $2") + ":"}
                attribute={sub}
              />
            );
          })}
        </CardDetailsBlock>
      )}
    </>
  );
};

export { CardDetailsNestedAttributes };
