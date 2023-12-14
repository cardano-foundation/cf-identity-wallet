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
