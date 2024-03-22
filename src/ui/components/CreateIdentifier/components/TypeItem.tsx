import { IonCard } from "@ionic/react";
import { TypeItemProps } from "../CreateIdentifier.types";

const TypeItem = ({ index, text, clickEvent, selectedType }: TypeItemProps) => {
  return (
    <IonCard
      onClick={clickEvent}
      className={`type-input ${selectedType === index ? "selected-type" : ""}`}
    >
      <span>{text}</span>
    </IonCard>
  );
};

export { TypeItem };
