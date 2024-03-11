import { IonCard } from "@ionic/react";
import { CardDetailsInfoBlockProps } from "./CardDetailsElements.types";
import "./CardDetailsInfoBlock.scss";

const CardDetailsInfoBlock = ({
  title,
  children,
}: CardDetailsInfoBlockProps) => {
  return (
    <div className="card-details-info-block">
      <h4>{title}</h4>
      <IonCard className="card-details-info-block-inner">{children}</IonCard>
    </div>
  );
};

export { CardDetailsInfoBlock };
