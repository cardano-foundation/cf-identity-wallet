import { IonItem, IonLabel } from "@ionic/react";
import { CardDetailsContentProps } from "./CardDetailsContent.types";
import "./CardDetailsContent.scss";

const CardDetailsContent = ({
  mainContent,
  subContent,
  testId,
}: CardDetailsContentProps) => {
  return (
    <IonItem
      data-testid={testId}
      lines="none"
      className="card-detail-stack-item"
    >
      <IonLabel>
        <h2>{mainContent}</h2>
        <p>{subContent}</p>
      </IonLabel>
    </IonItem>
  );
};

export { CardDetailsContent };
