import { IonCard, IonCol, IonGrid, IonIcon, IonRow } from "@ionic/react";
import { checkmark } from "ionicons/icons";
import {
  IdentifierThemeSelectorProps,
  ThemeItemProps,
} from "../CreateIdentifier.types";
import "./IdentifierThemeSelector.scss";
import { IDENTIFIER_BG_MAPPING } from "../../../globals/types";

const IdentifierThemeSelector = ({
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

  const Circle = () => {
    return (
      <div
        className="unselected-theme-circle"
        data-testid="unselected-theme-circle"
      />
    );
  };

  const ThemeItem = ({ index }: ThemeItemProps) => {
    return (
      <IonCol className={`${selectedTheme === index ? "selected-theme" : ""}`}>
        <IonCard
          onClick={() => setSelectedTheme(index)}
          data-testid={`identifier-theme-selector-item-${index}`}
          className="theme-input"
          style={{
            backgroundImage: `url(${IDENTIFIER_BG_MAPPING[index]})`,
            backgroundSize: "cover",
          }}
        >
          {selectedTheme === index ? <Checkmark /> : <Circle />}
        </IonCard>
      </IonCol>
    );
  };
  return (
    <IonGrid
      className="identifier-theme-selector"
      data-testid="identifier-theme-selector"
    >
      <>
        <IonRow className="identifier-theme-input">
          <ThemeItem index={0} />
          <ThemeItem index={1} />
        </IonRow>
      </>
    </IonGrid>
  );
};

export { IdentifierThemeSelector };
