import { IonCard, IonIcon } from "@ionic/react";
import { informationCircleOutline } from "ionicons/icons";
import { InfoCardProps } from "./InfoCard.types";
import { combineClassNames } from "../../utils/style";
import "./InfoCard.scss";

const InfoCard = ({ content, className, icon, danger }: InfoCardProps) => {
  const classes = combineClassNames("info-card", className, {
    danger: !!danger,
  });

  return (
    <IonCard className={classes}>
      <p>{content}</p>
      <div className="alert-icon">
        <IonIcon
          icon={icon ?? informationCircleOutline}
          slot="icon-only"
        />
      </div>
    </IonCard>
  );
};

export { InfoCard };
