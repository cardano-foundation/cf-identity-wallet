import { IonIcon } from "@ionic/react";
import { wifi, batteryFullOutline, cellular } from "ionicons/icons";
import { formatShortTime } from "../../utils/formatters";
import "./MobileHeaderPreview.scss";

export const MobileHeaderPreview = () => {
  const date = formatShortTime(new Date().toISOString());

  return (
    <div
      data-testid="mobile-preview-header"
      className="mobile-preview-header"
    >
      <div className="left-side">{date}</div>
      <div className="camera" />
      <div className="right-side">
        <IonIcon
          slot="icon-only"
          icon={cellular}
        />
        <IonIcon
          slot="icon-only"
          icon={wifi}
        />
        <IonIcon
          slot="icon-only"
          icon={batteryFullOutline}
        />
      </div>
    </div>
  );
};
