import { useState } from "react";
import { IonButton, IonIcon, IonInput, IonItem, IonLabel } from "@ionic/react";
import { eyeOutline, eyeOffOutline } from "ionicons/icons";
import { CustomInputProps } from "./CustomInput.types";
import "./CustomInput.scss";
import { i18n } from "../../../i18n";

const CustomInput = ({
  dataTestId,
  title,
  placeholder,
  hiddenInput,
  setValue,
  setFocus,
  optional,
}: CustomInputProps) => {
  const [hidden, setHidden] = useState(hiddenInput);

  const handleInput = (e: any) => {
    setValue(e.target.value);
  };

  const handleFocus = (focus: boolean) => {
    if (setFocus) {
      setFocus(focus);
    }
  };
  return (
    <IonItem className="input-item">
      <IonLabel position="stacked">
        {title}
        {optional && (
          <span className="input-item-optional">
            {i18n.t("custominput.optional")}
          </span>
        )}
      </IonLabel>
      <div className="input-line">
        <IonInput
          data-testid={dataTestId}
          type={hidden ? "password" : "text"}
          placeholder={placeholder}
          onIonChange={(e) => setValue(`${e.target.value ?? ""}`)}
          onIonFocus={() => handleFocus(true)}
          onIonBlur={() => handleFocus(false)}
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

export { CustomInput };
