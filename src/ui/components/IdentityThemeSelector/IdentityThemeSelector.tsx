import { IonCol, IonIcon, IonItem, IonRow } from "@ionic/react";
import { checkmark } from "ionicons/icons";
import {
  IdentityThemeSelectorProps,
  ThemeItemProps,
} from "./IdentityThemeSelector.types";
import "./IdentityThemeSelector.scss";
import { MAPPING_THEME_BACKGROUND } from "../../constants/dictionary";

const IdentityThemeSelector = ({
  identityType,
  selectedTheme,
  setSelectedTheme,
}: IdentityThemeSelectorProps) => {
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
          data-testid={`identity-theme-selector-item-${index}`}
          className="theme-input"
          style={{
            backgroundImage: `url(${MAPPING_THEME_BACKGROUND[index]})`,
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
      className="identity-theme-selector"
      data-testid="identity-theme-selector"
    >
      {identityType === 0 ? (
        <>
          <IonRow className="identity-theme-input">
            <ThemeItem index={0} />
            <ThemeItem index={1} />
          </IonRow>
          <IonRow className="identity-theme-input">
            <ThemeItem index={2} />
            <ThemeItem index={3} />
          </IonRow>
        </>
      ) : (
        <IonRow className="identity-theme-input">
          <ThemeItem index={4} />
          <ThemeItem index={5} />
        </IonRow>
      )}
    </div>
  );
};

export { IdentityThemeSelector };
