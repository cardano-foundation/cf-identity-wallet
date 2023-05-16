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
  optional,
}: InputItemProps) => {
  const [hidden, setHidden] = useState(hiddenInput);
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
        />
        <IonButton
          shape="round"
          onClick={() => {
            setHidden(!hidden);
          }}
        >
          {hiddenInput && (
            <IonIcon
              slot="icon-only"
              icon={hidden ? eyeOutline : eyeOffOutline}
              color="primary"
            />
          )}
        </IonButton>
      </div>
    </IonItem>
  );
};

export { InputItem };
