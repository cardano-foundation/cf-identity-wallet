import { IonItem } from "@ionic/react";
import { TypeItemProps } from "../CreateIdentifier.types";

const TypeItem = ({ index, text, clickEvent, selectedType }: TypeItemProps) => {
  return (
    <IonItem
      onClick={clickEvent}
      className={`type-input ${selectedType === index ? "selected-type" : ""}`}
    >
      <span>{text}</span>
    </IonItem>
  );
};

export { TypeItem };
