import { IonCol, IonIcon, IonItem, IonRow } from "@ionic/react";
import { checkmark } from "ionicons/icons";
import BackgroundDidKey0 from "../../../ui/assets/images/did-key-0.png";
import BackgroundDidKey1 from "../../../ui/assets/images/did-key-1.png";
import BackgroundDidKey2 from "../../../ui/assets/images/did-key-2.png";
import BackgroundDidKey3 from "../../../ui/assets/images/did-key-3.png";
import BackgroundKERI0 from "../../../ui/assets/images/keri-0.png";
import BackgroundKERI1 from "../../../ui/assets/images/keri-1.png";
import { IdentityThemeSelectorProps } from "./IdentityThemeSelector.types";
import "./IdentityThemeSelector.scss";

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

  interface ThemeItemProps {
    index: number;
  }

  const ThemeItem = ({ index }: ThemeItemProps) => {
    const MAPPING_THEME_BACKGROUND: Record<number, unknown> = {
      0: BackgroundDidKey0,
      1: BackgroundDidKey1,
      2: BackgroundDidKey2,
      3: BackgroundDidKey3,
      4: BackgroundKERI0,
      5: BackgroundKERI1,
    };

    return (
      <IonCol className={`${selectedTheme === index ? "selected-theme" : ""}`}>
        <IonItem
          onClick={() => setSelectedTheme(index)}
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
