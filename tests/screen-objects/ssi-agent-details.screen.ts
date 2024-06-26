import { expect } from "expect-webdriverio";

export class SsiAgentDetailsScreen {
  get validateButton() {
    return $("[data-testid=\"primary-button-create-ssi-agent\"]");
  }

  async tapOnValidatedButton() {
    await expect(this.validateButton).toBeDisplayed();
    await expect(this.validateButton).toBeEnabled();
    await this.validateButton.click();
  }

  async loads() {
    await expect(this.validateButton).toBeDisplayed();
  }
}

export default new SsiAgentDetailsScreen();
