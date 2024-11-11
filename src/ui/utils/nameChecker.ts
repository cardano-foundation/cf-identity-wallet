import { i18n } from "../../i18n";

const nameRequirements = {
  validCharactersPattern: /^[a-zA-Z0-9-_\s]+$/,
  lengthPattern: /^.{3,50}$/,
  onlySpacePattern: /^\s+$/
};

const nameErrorMessages = {
  invalidCharacter: i18n.t("nameerror.hasSpecialChar"),
  invalidMaxLength: i18n.t("nameerror.maxlength"),
  invalidMinLength: i18n.t("nameerror.onlyspace"),
  invalidSpaceCharacter: i18n.t("nameerror.onlyspace"),
}

const nameChecker = {
  isValidCharacters(name: string) { return nameRequirements.validCharactersPattern.test(name); },
  isValidLength(name: string) { return nameRequirements.lengthPattern.test(name); },
  hasNonSpaceCharacter(name: string) { return !nameRequirements.onlySpacePattern.test(name); },
  getError(name: string) {
    if (name.length > 50) {
      return nameErrorMessages.invalidMaxLength;
    }

    if (!name) {
      return nameErrorMessages.invalidMinLength;
    }

    if (!this.isValidCharacters(name)) {
      return nameErrorMessages.invalidCharacter;
    }

    if (!nameChecker.hasNonSpaceCharacter(name)) {
      return nameErrorMessages.invalidSpaceCharacter;
    }

    return undefined;
  }
}

export { nameChecker };

