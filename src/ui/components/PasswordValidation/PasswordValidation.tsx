import { IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import { checkmarkOutline, closeOutline } from "ionicons/icons";
import { passwordStrengthChecker } from "../../utils/passwordStrengthChecker";
import { i18n } from "../../../i18n";
import { ErrorMessage } from "../ErrorMessage";
import "./PasswordValidation.scss";

const ValidationItem = ({
  condition,
  label,
  testId,
}: {
  condition: boolean;
  label: string;
  testId: string;
}) => {
  return (
    <IonItem data-testid={testId}>
      <IonIcon
        slot="start"
        icon={condition ? checkmarkOutline : closeOutline}
        className={`password-criteria-icon${condition ? " pass" : " fails"}`}
      />
      <IonLabel>{label}</IonLabel>
    </IonItem>
  );
};

const PasswordValidation = ({ password }: { password: string }) => {
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
          id: "password-validation-length",
        },
        {
          condition: passwordStrengthChecker.isUppercaseValid(password),
          label: i18n.t("operationspasswordregex.label.uppercase"),
          id: "password-validation-uppercase",
        },
        {
          condition: passwordStrengthChecker.isLowercaseValid(password),
          label: i18n.t("operationspasswordregex.label.lowercase"),
          id: "password-validation-lowercase",
        },
        {
          condition: passwordStrengthChecker.isNumberValid(password),
          label: i18n.t("operationspasswordregex.label.number"),
          id: "password-validation-number",
        },
        {
          condition: passwordStrengthChecker.isSymbolValid(password),
          label: i18n.t("operationspasswordregex.label.symbol"),
          id: "password-validation-symbol",
        },
      ].map(({ condition, label, id }) => (
        <ValidationItem
          key={label}
          condition={condition}
          label={label}
          testId={id}
        />
      ))}
    </IonList>
  );
};

export { PasswordValidation };
