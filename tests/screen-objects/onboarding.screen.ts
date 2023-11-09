import { expect } from "expect-webdriverio"

export class OnboardingScreen {
  get getStartedButton () { return $("[data-testid=\"continue-button\"]") }
  get iAlreadyHaveAWalletButton () { return $("[data-testid=\"secondary-button\"]") }


  async tapOnGetStartedButton() {
    await expect(this.getStartedButton).toBeDisplayed();
    await expect(this.getStartedButton).toBeEnabled();
    await this.getStartedButton.click();
  }

  async screenLoads() {
    await expect(this.getStartedButton).toBeDisplayed();
    await expect(this.iAlreadyHaveAWalletButton).toBeDisplayed();
  }
}

export default new OnboardingScreen();
