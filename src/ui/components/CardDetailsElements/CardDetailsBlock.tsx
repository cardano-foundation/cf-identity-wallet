import { IonCard } from "@ionic/react";
import { CardDetailsBlockProps } from "./CardDetailsElements.types";

const CardDetailsBlock = ({ title, children }: CardDetailsBlockProps) => {
  return (
    <div className="card-details-info-block">
      <h4
        data-testid={`card-block-title-${title
          .replace(/\s+/g, "")
          .toLowerCase()}`}
      >
        {title}
      </h4>
      <IonCard className="card-details-info-block-inner">{children}</IonCard>
    </div>
  );
};

export { CardDetailsBlock };
