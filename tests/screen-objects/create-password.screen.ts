import { expect } from "expect-webdriverio";
import { CreatePassword } from "../constants/text.constants.js";

export class CreatePasswordScreen {
  get alertModal() {
    return "[data-testid=\"create-password-alert-skip\"]";
  }

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

  get id() {
    return "[data-testid=\"create-password-page\"]";
  }

  get screenTitle() {
    return $("[data-testid=\"create-password-title\"]");
  }

  get screenTopParagraph() {
    return $("[data-testid=\"create-password-top-paragraph\"]");
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
    await expect(this.screenTitle).toHaveText(CreatePassword.Title);
    await expect(this.screenTopParagraph).toBeDisplayed();
    await expect(this.screenTopParagraph).toHaveText(
      CreatePassword.Description
    );
    await expect(this.createPasswordInput).toBeDisplayed();
    await expect(this.confirmPasswordInput).toBeDisplayed();
    await expect(this.hintInput).toBeDisplayed();
    await expect(this.createPasswordButton).toBeExisting();
    await expect(this.skipButton).toBeDisplayed();
  }
}

export default new CreatePasswordScreen();
