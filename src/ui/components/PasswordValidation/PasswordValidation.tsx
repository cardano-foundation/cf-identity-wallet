import { IonList, IonItem, IonIcon, IonLabel } from "@ionic/react";
import { checkmarkOutline, closeOutline } from "ionicons/icons";
import { passwordStrengthChecker } from "../../utils/passwordStrengthChecker";
import { i18n } from "../../../i18n";
import { ErrorMessage } from "../ErrorMessage";
import "./PasswordValidation.scss";

const PasswordValidation = ({ password }: { password: string }) => {
  const ValidationItem = ({
    condition,
    label,
  }: {
    condition: boolean;
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
      className="password-validation"
    >
      {(!passwordStrengthChecker.validatePassword(password) ||
        !passwordStrengthChecker.isValidCharacters(password)) && (
        <ErrorMessage
          message={`${
            password.length &&
            passwordStrengthChecker.getErrorByPriority(password)
          }`}
          timeout={false}
        />
      )}
      {[
        {
          condition: passwordStrengthChecker.isLengthValid(password),
          label: i18n.t("operationspasswordregex.label.length"),
        },
        {
          condition: passwordStrengthChecker.isUppercaseValid(password),
          label: i18n.t("operationspasswordregex.label.uppercase"),
        },
        {
          condition: passwordStrengthChecker.isLowercaseValid(password),
          label: i18n.t("operationspasswordregex.label.lowercase"),
        },
        {
          condition: passwordStrengthChecker.isNumberValid(password),
          label: i18n.t("operationspasswordregex.label.number"),
        },
        {
          condition: passwordStrengthChecker.isSymbolValid(password),
          label: i18n.t("operationspasswordregex.label.symbol"),
        },
      ].map(({ condition, label }) => (
        <ValidationItem
          key={label}
          condition={condition}
          label={label}
        />
      ))}
    </IonList>
  );
};

export { PasswordValidation };
