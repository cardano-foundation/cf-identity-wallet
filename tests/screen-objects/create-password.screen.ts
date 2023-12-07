import { expect } from "expect-webdriverio";

export class CreatePasswordScreen {
  get backArrowIcon() {
    return $("[data-testid=\"back-button\"]");
  }

  get confirmPasswordInput() {
    return $("[data-testid=\"confirm-password-value\"]");
  }

  get createPasswordButton() {
    return $("[data-testid=\"primary-button-create-password\"]");
  }

  get createPasswordInput() {
    return $("[data-testid=\"createPasswordValue\"]");
  }

  get hintInput() {
    return $("[data-testid=\"hintValue\"]");
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

  async screenLoads() {
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
