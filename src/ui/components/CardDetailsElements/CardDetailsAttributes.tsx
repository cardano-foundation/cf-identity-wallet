import { CardDetailsAttributesProps } from "./CardDetailsElements.types";
import { CardDetailsItem } from "./CardDetailsItem";

const nestedObject = (item: any) => {
  return (
    <>
      {typeof item === ("string" || "number") && (
        <span>{item.replace(/([a-z])([A-Z])/g, "$1 $2")}</span>
      )}
      {typeof item === "object" && item !== null && (
        <div className="card-details-json-column">
          {Object.entries(item).map((sub: any, i: number) => {
            return (
              <div
                className={`card-details-json-${
                  typeof sub[1] !== ("string" || "number") ? "column" : "nested"
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

const CardDetailsAttributes = ({ data }: CardDetailsAttributesProps) => {
  const attributes = Object.entries(data);
  return (
    <>
      {attributes.map((item, index) => {
        return (
          <div
            className={
              typeof item[1] !== ("string" || "number")
                ? "card-details-json-column"
                : "card-details-json-row"
            }
            key={index}
          >
            {item[0] === "id" ? (
              <span className="card-details-json-row card-details-attributes-id">
                <strong>{item[0] + ":"}</strong>
                <CardDetailsItem
                  info={item[1] as string}
                  copyButton={true}
                  testId="card-details-attributes-id"
                />
              </span>
            ) : (
              <span
                className={
                  typeof item[1] !== ("string" || "number")
                    ? "card-details-json-column"
                    : "card-details-json-row"
                }
              >
                <strong>
                  {item[0].replace(/([a-z])([A-Z])/g, "$1 $2") + ":"}
                </strong>
                {nestedObject(item[1])}
              </span>
            )}
          </div>
        );
      })}
    </>
  );
};

export { CardDetailsAttributes };
