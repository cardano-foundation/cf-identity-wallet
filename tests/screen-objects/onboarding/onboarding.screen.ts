import { expect } from "expect-webdriverio";

export class OnboardingScreen {
  get getStartedButton() {
    return $("[data-testid=\"primary-button-onboarding\"]");
  }

  get iAlreadyHaveAWalletButton() {
    return $("[data-testid=\"tertiary-button-onboarding\"]");
  }

  async tapOnGetStartedButton() {
    await expect(this.getStartedButton).toBeDisplayed();
    await expect(this.getStartedButton).toBeEnabled();
    await this.getStartedButton.click();
  }

  async loads() {
    await expect(this.getStartedButton).toBeDisplayed();
    await expect(this.iAlreadyHaveAWalletButton).toBeDisplayed();
  }
}

export default new OnboardingScreen();
