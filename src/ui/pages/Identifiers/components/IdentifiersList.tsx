import { IonItem, IonLabel, IonList } from "@ionic/react";
import {
  IdentifierShortDetails,
  IdentifierType,
} from "../../../../core/agent/services/identifier.types";
import { IDENTIFIER_BG_MAPPING } from "../../../globals/types";
import { i18n } from "../../../../i18n";
import { formatShortDate } from "../../../utils/formatters";

const IdentifiersList = ({
  identifiers,
  showDate,
  handleClick,
}: {
  identifiers: IdentifierShortDetails[];
  showDate?: boolean;
  handleClick?: (identifier: IdentifierShortDetails) => void;
}) => {
  const componentId = "identifiers-list";
  return (
    <IonList
      lines="none"
      className={componentId}
      data-testid={componentId}
    >
      {identifiers.map((identifier: IdentifierShortDetails, index: number) => {
        return (
          <IonItem
            key={index}
            className="identifier-item"
            data-testid={`identifier-item-${index}`}
            onClick={() => handleClick && handleClick(identifier)}
          >
            <IonLabel>
              <div
                className="identifier-miniature"
                data-testid={`identifier-miniature-${index}`}
                style={{
                  backgroundImage: `url(${
                    IDENTIFIER_BG_MAPPING[identifier.theme]
                  })`,
                  backgroundSize: "cover",
                }}
              />
              <div className="identifier-info">
                <div className="identifier-info-top-line">
                  {identifier.displayName
                    .replace(/([A-Z][a-z])/g, " $1")
                    .replace(/(\d)/g, " $1")}
                </div>
                <div
                  className="identifier-info-bottom-line"
                  data-testid={`identifier-info-${index}`}
                >
                  {identifier.method === IdentifierType.KERI
                    ? i18n.t("identifiers.tab.type.keri")
                    : i18n.t("identifiers.tab.type.didkey")}
                  {showDate &&
                    "  •  " + formatShortDate(identifier.createdAtUTC)}
                </div>
              </div>
            </IonLabel>
          </IonItem>
        );
      })}
    </IonList>
  );
};

export { IdentifiersList };
