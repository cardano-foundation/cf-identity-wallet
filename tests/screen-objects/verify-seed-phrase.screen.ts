import { expect } from "expect-webdriverio";

export class VerifySeedPhraseScreen {
  get continueButton() {
    return $("[data-testid=\"primary-button-verify-seed-phrase\"]");
  }

  get seedPhraseContainer() {
    return $("[data-testid=\"matching-seed-phrase-container\"]");
  }

  async loads() {
    await expect(this.seedPhraseContainer).toBeDisplayed();
  }
}

export default new VerifySeedPhraseScreen();
