import { CardDetailsAttribute } from "./CardDetailsAttribute";
import "./CardDetailsAttributes.scss";
import { CardDetailsExpandAttributesProps } from "./CardDetailsExpandAttributes.types";

const CardDetailsExpandAttributes = ({
  data,
  itemProps,
  ignoreKeys = [],
  openLevels = [],
}: CardDetailsExpandAttributesProps) => {
  const attributes = Object.entries(data);

  return (
    <div className="expand-attributes">
      <div className="nested-list-item container-nested-list-item">
        {attributes.map(([key, value]) => {
          if (ignoreKeys.includes(key)) return;

          return (
            <CardDetailsAttribute
              key={key}
              attributeKey={key}
              attributeValue={value}
              itemProps={itemProps}
              ignoreKeys={ignoreKeys}
              openLevels={openLevels}
            />
          );
        })}
      </div>
    </div>
  );
};

export { CardDetailsExpandAttributes };
