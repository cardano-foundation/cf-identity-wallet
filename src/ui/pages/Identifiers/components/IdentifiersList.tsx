import { IonItem, IonLabel, IonList } from "@ionic/react";
import {
  IdentifierShortDetails,
  IdentifierType,
} from "../../../../core/agent/services/identifierService.types";
import { IDENTIFIER_BG_MAPPING } from "../../../globals/types";
import { i18n } from "../../../../i18n";
import { formatShortDate } from "../../../utils/formatters";

const IdentifiersList = ({
  identifiers,
  showDate,
}: {
  identifiers: IdentifierShortDetails[];
  showDate?: boolean;
}) => {
  return (
    <IonList
      lines="none"
      className="identifiers-list"
    >
      {identifiers.map((identifier: IdentifierShortDetails, index: number) => {
        return (
          <IonItem
            className="identifier-item"
            key={index}
          >
            <IonLabel>
              <div
                className="identifier-miniature"
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
                <div className="identifier-info-bottom-line">
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
