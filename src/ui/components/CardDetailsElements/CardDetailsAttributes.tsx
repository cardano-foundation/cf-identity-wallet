import { i18n } from "../../../i18n";
import { formatShortDate, formatTimeToSec } from "../../utils/formatters";
import { CardDetailsAttributesProps } from "./CardDetailsElements.types";
import { CardDetailsItem } from "./CardDetailsItem";

const CardDetailsAttributes = ({
  data,
  customType,
}: CardDetailsAttributesProps) => {
  const attributes = Object.entries(data);

  const reservedKeysFilter = (item: string) => {
    switch (item) {
    case "i":
      return i18n.t("creds.card.details.attributes.issuee");
    case "dt":
      return customType === "status"
        ? i18n.t("creds.card.details.status.timestamp")
        : i18n.t("creds.card.details.attributes.issuancedate");
    case "LEI":
      return i18n.t("creds.card.details.attributes.lei");
    case "s":
      return i18n.t("creds.card.details.status.label");
    default:
      return item.replace(/([a-z])([A-Z])/g, "$1 $2");
    }
  };

  const nestedObject = (item: any) => {
    return (
      <>
        {item[10] === "T" ? (
          <span>{formatShortDate(item) + " - " + formatTimeToSec(item)}</span>
        ) : (
          typeof item === ("string" || "number") && (
            <span>
              {customType === "status" ? (
                <span>
                  {item === "0"
                    ? i18n.t("creds.card.details.status.issued")
                    : i18n.t("creds.card.details.status.revoked")}
                </span>
              ) : (
                <span>{item}</span>
              )}
            </span>
          )
        )}
        {typeof item === "object" && item !== null && (
          <div className="card-details-json-column">
            {Object.entries(item).map((sub: any, i: number) => {
              return (
                <div
                  className={`card-details-json-${
                    typeof sub[1] !== ("string" || "number")
                      ? "column"
                      : "nested"
                  }`}
                  key={i}
                >
                  <span className="card-details-json-row">
                    <strong>
                      {sub[0].replace(/([a-z])([A-Z])/g, "$1 $2") + ":"}
                    </strong>
                    {nestedObject(sub[1])}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

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
              testId="card-details-attributes-id"
            />
          );
        }
        case "d": {
          return;
        }
        default: {
          const isColumn =
              typeof item[1] !== "string" && typeof item[1] !== "number";
          const className = isColumn
            ? "card-details-json-column"
            : "card-details-json-row";
          return typeof item[1] === ("string" || "number") &&
              !customType &&
              !`${item[1]}`.includes(" ") &&
              `${item[1]}`[10] !== "T" ? (
              <CardDetailsItem
                key={index}
                keyValue={`${reservedKeysFilter(item[0])}:`}
                info={item[1] as string}
                copyButton={true}
                testId="card-details-generic-attribute"
              />
            ) : (
              <div
                className={className}
                key={index}
              >
                <span className={className}>
                  <strong>{`${reservedKeysFilter(item[0])}:`}</strong>
                  {nestedObject(item[1])}
                </span>
              </div>
            );
        }
        }
      })}
    </>
  );
};

export { CardDetailsAttributes };
