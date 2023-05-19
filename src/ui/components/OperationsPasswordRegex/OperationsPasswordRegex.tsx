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
  const specialChar = password.match(/(^[A-Za-z0-9]|[^\p{L}\d\s])$/u);
  const length = password.match(/^.{8,64}$/);
  const uppercase = password.match(/([A-Z])/);
  const lowercase = password.match(/([a-z])/);
  const number = password.match(/([0-9])/);
  const symbol = password.match(/[^\p{L}\d\s]/u);

  useEffect(() => {
    const regexState = (pass: boolean) => {
      switch (pass) {
        case !!specialChar:
          return "specialChar";
        case !!length:
          return "length";
        case !!uppercase:
          return "uppercase";
        case !!lowercase:
          return "lowercase";
        case !!number:
          return "number";
        case !!symbol:
          return "symbol";
        default:
          break;
      }
    };

    setRegexState(String(regexState(false) || ""));
  }, [specialChar, length, uppercase, lowercase, number, symbol]);

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
        condition={length}
        label={i18n.t("operationspasswordregex.label.length")}
      />
      <RegexItem
        condition={uppercase}
        label={i18n.t("operationspasswordregex.label.uppercase")}
      />
      <RegexItem
        condition={lowercase}
        label={i18n.t("operationspasswordregex.label.lowercase")}
      />
      <RegexItem
        condition={number}
        label={i18n.t("operationspasswordregex.label.number")}
      />
      <RegexItem
        condition={symbol}
        label={i18n.t("operationspasswordregex.label.symbol")}
      />
    </IonList>
  );
};

export { OperationsPasswordRegex };
