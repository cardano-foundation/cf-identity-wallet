import { IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import { closeOutline, checkmarkOutline } from "ionicons/icons";
import "./OperationsPasswordRegex.scss";
import { useEffect } from "react";
import { i18n } from "../../../i18n";
import { OperationsPasswordRegexProps } from "./OperationsPasswordRegex.types";

const OperationsPasswordRegex = ({
  password,
  setRegexState,
}: OperationsPasswordRegexProps) => {
  const hasSpecialChar = password.match(/(^[A-Za-z0-9]|[^\p{L}\d\s])$/u);
  const hasLength = password.match(/^.{8,64}$/);
  const hasUppercase = password.match(/([A-Z])/);
  const hasLowercase = password.match(/([a-z])/);
  const hasNumber = password.match(/([0-9])/);
  const hasSymbol = password.match(/[^\p{L}\d\s]/u);

  useEffect(() => {
    const regexState = (pass: boolean) => {
      switch (pass) {
        case !!hasSpecialChar:
          return "hasSpecialChar";
        case !!hasLength:
          return "hasLength";
        case !!hasUppercase:
          return "hasUppercase";
        case !!hasLowercase:
          return "hasLowercase";
        case !!hasNumber:
          return "hasNumber";
        case !!hasSymbol:
          return "hasSymbol";
        default:
          break;
      }
    };

    setRegexState(String(regexState(false) || ""));
  }, [
    hasSpecialChar,
    hasLength,
    hasLowercase,
    hasNumber,
    hasSymbol,
    hasUppercase,
  ]);

  const RegexItem = ({
    condition,
    label,
  }: {
    condition: RegExpMatchArray | null;
    label: string;
  }) => {
    return (
      <IonItem>
        <IonIcon
          slot="start"
          icon={condition ? checkmarkOutline : closeOutline}
          className={`password-criteria-icon${condition ? " pass" : " fails"}`}
        />
        <IonLabel>{label}</IonLabel>
      </IonItem>
    );
  };
  return (
    <IonList
      lines="none"
      className="operations-password-regex"
    >
      <RegexItem
        condition={hasLength}
        label={i18n.t("operationspasswordregex.label.hasLength")}
      />
      <RegexItem
        condition={hasUppercase}
        label={i18n.t("operationspasswordregex.label.hasUppercase")}
      />
      <RegexItem
        condition={hasLowercase}
        label={i18n.t("operationspasswordregex.label.hasLowercase")}
      />
      <RegexItem
        condition={hasNumber}
        label={i18n.t("operationspasswordregex.label.hasNumber")}
      />
      <RegexItem
        condition={hasSymbol}
        label={i18n.t("operationspasswordregex.label.hasSymbol")}
      />
    </IonList>
  );
};

export { OperationsPasswordRegex };
