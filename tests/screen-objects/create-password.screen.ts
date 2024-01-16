import { expect } from "expect-webdriverio";

export class CreatePasswordScreen {
  get backArrowIcon() {
    return $("[data-testid=\"back-button\"]");
  }

  get confirmPasswordInput() {
    return $("#ion-input-1");
  }

  get createPasswordButton() {
    return $("[data-testid=\"primary-button-create-password\"]");
  }

  get createPasswordInput() {
    return $("#ion-input-0");
  }

  get errorMessageText() {
    return $("[data-testid=\"error-message-text\"]");
  }

  get hintInput() {
    return $("#ion-input-2");
  }

  get pageTopParagraph() {
    return $("[data-testid=\"create-password-top-paragraph\"]");
  }

  get screenTitle() {
    return $("[data-testid=\"create-password-title\"]");
  }

  get skipButton() {
    return $("[data-testid=\"tertiary-button-create-password\"]");
  }

  get validationLengthIcon() {
    return $("[data-testid=\"password-validation-length\"] > ion-icon");
  }

  get validationLowercaseIcon() {
    return $("[data-testid=\"password-validation-lowercase\"] > ion-icon");
  }

  get validationNumberIcon() {
    return $("[data-testid=\"password-validation-number\"] > ion-icon");
  }

  get validationSymbolIcon() {
    return $("[data-testid=\"password-validation-symbol\"] > ion-icon");
  }

  get validationUppercaseIcon() {
    return $("[data-testid=\"password-validation-uppercase\"] > ion-icon");
  }

  async loads() {
    await expect(this.backArrowIcon).toBeExisting();
    await expect(this.screenTitle).toBeDisplayed();
    await expect(this.pageTopParagraph).toBeDisplayed();
    await expect(this.createPasswordInput).toBeDisplayed();
    await expect(this.confirmPasswordInput).toBeDisplayed();
    await expect(this.hintInput).toBeDisplayed();
    await expect(this.createPasswordButton).toBeExisting();
    await expect(this.skipButton).toBeDisplayed();
  }
}

export default new CreatePasswordScreen();
