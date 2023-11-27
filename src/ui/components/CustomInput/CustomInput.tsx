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
  autofocus,
  onChangeInput,
  onChangeFocus,
  optional,
  value,
  error,
}: CustomInputProps) => {
  const [hidden, setHidden] = useState(hiddenInput);

  const handleFocus = (focus: boolean) => {
    if (onChangeFocus) {
      onChangeFocus(focus);
    }
  };
  return (
    <IonItem className={`custom-input ${error ? "error" : ""}`}>
      <IonLabel position="stacked">
        {title}
        {optional && (
          <span className="custom-input-optional">
            {i18n.t("custominput.optional")}
          </span>
        )}
      </IonLabel>
      <div className="input-line">
        <IonInput
          id={dataTestId}
          data-testid={dataTestId}
          label={title}
          labelPlacement="stacked"
          type={hidden ? "password" : "text"}
          autofocus={autofocus}
          placeholder={placeholder}
          onIonInput={(e) => onChangeInput(e.target.value as string)}
          onIonFocus={() => handleFocus(true)}
          onIonBlur={() => handleFocus(false)}
          value={value}
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
