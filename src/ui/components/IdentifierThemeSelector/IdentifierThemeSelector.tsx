import { IonCol, IonIcon, IonItem, IonRow } from "@ionic/react";
import { checkmark } from "ionicons/icons";
import {
  IdentifierThemeSelectorProps,
  ThemeItemProps,
} from "./IdentifierThemeSelector.types";
import "./identifierThemeSelector.scss";
import { IDENTIFIER_BG_MAPPING } from "../../globals/types";

const IdentifierThemeSelector = ({
  identifierType,
  selectedTheme,
  setSelectedTheme,
}: IdentifierThemeSelectorProps) => {
  const Checkmark = () => {
    return (
      <div
        className="selected-theme-checkmark"
        data-testid="selected-theme-checkmark"
      >
        <div className="selected-theme-checkmark-inner">
          <IonIcon
            slot="icon-only"
            icon={checkmark}
          />
        </div>
      </div>
    );
  };

  const ThemeItem = ({ index }: ThemeItemProps) => {
    return (
      <IonCol className={`${selectedTheme === index ? "selected-theme" : ""}`}>
        <IonItem
          onClick={() => setSelectedTheme(index)}
          data-testid={`identifier-theme-selector-item-${index}`}
          className="theme-input"
          style={{
            backgroundImage: `url(${IDENTIFIER_BG_MAPPING[index]})`,
            backgroundSize: "cover",
          }}
        >
          {selectedTheme === index && <Checkmark />}
        </IonItem>
      </IonCol>
    );
  };
  return (
    <div
      className="identifier-theme-selector"
      data-testid="identifier-theme-selector"
    >
      {identifierType === 0 ? (
        <>
          <IonRow className="identifier-theme-input">
            <ThemeItem index={0} />
            <ThemeItem index={1} />
          </IonRow>
          <IonRow className="identifier-theme-input">
            <ThemeItem index={2} />
            <ThemeItem index={3} />
          </IonRow>
        </>
      ) : (
        <IonRow className="identifier-theme-input">
          <ThemeItem index={4} />
          <ThemeItem index={5} />
        </IonRow>
      )}
    </div>
  );
};

export { IdentifierThemeSelector };
