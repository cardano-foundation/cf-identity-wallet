import { IonButton, IonIcon } from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { CardsPlaceholderProps } from "./CardsPlaceholder.types";
import "./CardsPlaceholder.scss";

const CardsPlaceholder = ({
  buttonLabel,
  buttonAction,
}: CardsPlaceholderProps) => {
  return (
    <div className="cards-placeholder-container">
      <div className="cards-placeholder-cards">
        <span className="back-card" />
        <span className="front-card" />
      </div>
      <IonButton
        shape="round"
        expand="block"
        className="ion-primary-button"
        onClick={buttonAction}
      >
        <IonIcon
          slot="icon-only"
          size="small"
          icon={addOutline}
          color="primary"
        />
        {buttonLabel}
      </IonButton>
    </div>
  );
};

export { CardsPlaceholder };
