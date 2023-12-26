import { expect } from "expect-webdriverio";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export class VerifySeedPhraseScreen {
  get continueButton() {
    return $("[data-testid=\"primary-button-verify-seed-phrase\"]");
  }

  get seedPhraseContainer() {
    return $("[data-testid=\"matching-seed-phrase-container\"]");
  }

  async loads() {
    await expect(this.seedPhraseContainer).toBeDisplayed();
    await expect(this.continueButton).toBeExisting();
  }
}

export default new VerifySeedPhraseScreen();
