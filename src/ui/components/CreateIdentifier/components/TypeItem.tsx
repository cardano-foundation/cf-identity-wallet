import { IonCard } from "@ionic/react";
import { TypeItemProps } from "../CreateIdentifier.types";

const TypeItem = ({
  dataTestId,
  index,
  text,
  clickEvent,
  selectedType,
  disabled,
}: TypeItemProps) => {
  return (
    <IonCard
      data-testid={dataTestId}
      onClick={clickEvent}
      className={`type-input ${selectedType === index ? "selected-type" : ""}`}
      disabled={disabled}
    >
      <span>{text}</span>
    </IonCard>
  );
};

export { TypeItem };
