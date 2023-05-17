import { useState } from "react";
import { IonButton, IonIcon, IonInput, IonItem, IonLabel } from "@ionic/react";
import { eyeOutline, eyeOffOutline } from "ionicons/icons";
import { InputItemProps } from "./InputItem.types";
import "./InputItem.scss";
import { i18n } from "../../../i18n";

const InputItem = ({
  title,
  placeholder,
  hiddenInput,
  setValue,
  optional,
}: InputItemProps) => {
  const [hidden, setHidden] = useState(hiddenInput);
  const handleInput = (e: any) => {
    setValue(e.target.value);
  };
  return (
    <IonItem className="input-item">
      <IonLabel position="stacked">
        {title}
        {optional && (
          <span className="input-item-optional">
            {i18n.t("inputitem.optional")}
          </span>
        )}
      </IonLabel>
      <div className="input-line">
        <IonInput
          type={hidden ? "password" : "text"}
          placeholder={placeholder}
          onIonChange={(e) => handleInput(e)}
        />
        {hiddenInput && (
          <IonButton
            shape="round"
            onClick={() => {
              setHidden(!hidden);
            }}
          >
            <IonIcon
              slot="icon-only"
              icon={hidden ? eyeOutline : eyeOffOutline}
              color="primary"
            />
          </IonButton>
        )}
      </div>
    </IonItem>
  );
};

export { InputItem };
