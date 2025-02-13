import { i18n } from "../../i18n";
import { StrongLevel } from "../components/PasswordModule/components/PasswordMeter";

const passwordRequirements = {
  uppercasePattern: /^(?=.*[A-Z])/,
  lowercasePattern: /^(?=.*[a-z])/,
  numberPattern: /^(?=.*[0-9])/,
  symbolPattern: /^(?=.*[!"@#$£€%&'()*+,-./:;<=>?@[\\\]^-`{|}~])/,
  validCharactersPattern: /^[a-zA-Z0-9!"@#$£€%&'()*+,-./:;<=>?@[\\\]^-`{|}~]+$/,
  lengthPattern: /^.{8,64}$/,
};

const errorMessages = {
  hasSpecialChar: i18n.t("createpassword.error.hasSpecialChar"),
  passwordLength: i18n.t("createpassword.error.passwordlength"),
  hasNoUppercase: i18n.t("createpassword.error.hasNoUppercase"),
  hasNoLowercase: i18n.t("createpassword.error.hasNoLowercase"),
  hasNoNumber: i18n.t("createpassword.error.hasNoNumber"),
  hasNoSymbol: i18n.t("createpassword.error.hasNoSymbol"),
};

const passwordStrengthChecker = {
  isLengthValid(password: string): boolean {
    return passwordRequirements.lengthPattern.test(password);
  },
  isUppercaseValid(password: string): boolean {
    return passwordRequirements.uppercasePattern.test(password);
  },
  isLowercaseValid(password: string): boolean {
    return passwordRequirements.lowercasePattern.test(password);
  },
  isNumberValid(password: string): boolean {
    return passwordRequirements.numberPattern.test(password);
  },
  isSymbolValid(password: string): boolean {
    return passwordRequirements.symbolPattern.test(password);
  },
  isValidCharacters(password: string): boolean {
    return passwordRequirements.validCharactersPattern.test(password);
  },
  validationRules() {
    return [
      this.isUppercaseValid,
      this.isLowercaseValid,
      this.isNumberValid,
      this.isSymbolValid,
      this.isLengthValid,
    ];
  },
  validatePassword(password: string): boolean {
    return (
      this.isUppercaseValid(password) &&
      this.isLowercaseValid(password) &&
      this.isNumberValid(password) &&
      this.isSymbolValid(password) &&
      this.isValidCharacters(password) &&
      this.isLengthValid(password)
    );
  },
  getPasswordStrength(password: string) {
    let matchConditionCount = 0;

    this.validationRules().forEach((rule) => {
      if (rule(password)) matchConditionCount++;
    });

    if (matchConditionCount < 3) return StrongLevel.Weak;

    if (matchConditionCount < this.validationRules().length)
      return StrongLevel.Medium;

    return StrongLevel.Strong;
  },
  getErrorByPriority(password: string): string | undefined {
    if (password.length < 8 || password.length > 64) {
      return errorMessages.passwordLength;
    } else if (!this.isUppercaseValid(password)) {
      return errorMessages.hasNoUppercase;
    } else if (!this.isLowercaseValid(password)) {
      return errorMessages.hasNoLowercase;
    } else if (!this.isNumberValid(password)) {
      return errorMessages.hasNoNumber;
    } else if (!this.isSymbolValid(password)) {
      return errorMessages.hasNoSymbol;
    } else if (!this.isValidCharacters(password)) {
      return errorMessages.hasSpecialChar;
    }

    return undefined;
  },
};

export { passwordStrengthChecker, errorMessages };
