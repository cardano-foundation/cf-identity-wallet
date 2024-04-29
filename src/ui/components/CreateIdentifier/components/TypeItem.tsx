import { IonCard } from "@ionic/react";
import { TypeItemProps } from "../CreateIdentifier.types";

const TypeItem = ({
  dataTestId,
  index,
  text,
  clickEvent,
  selectedType,
}: TypeItemProps) => {
  return (
    <IonCard
      data-testid={dataTestId}
      onClick={clickEvent}
      className={`type-input ${selectedType === index ? "selected-type" : ""}`}
    >
      <span>{text}</span>
    </IonCard>
  );
};

export { TypeItem };
