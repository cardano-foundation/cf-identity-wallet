import { expect } from "expect-webdriverio";
import { VerifySeedPhrase } from "../constants/text.constants.js";

export class VerifySeedPhraseScreen {
  get continueButton() {
    return $("[data-testid=\"primary-button-verify-seed-phrase\"]");
  }

  get screenDescriptionText() {
    return $("[data-testid=\"verify-seed-phrase-paragraph-top\"]");
  }

  get screenTitle() {
    return $("[data-testid=\"verify-seed-phrase-title\"]");
  }

  get seedPhraseContainer() {
    return $("[data-testid=\"matching-seed-phrase-container\"]");
  }

  async loads() {
    await expect(this.screenTitle).toBeDisplayed();
    await expect(this.screenTitle).toHaveText(VerifySeedPhrase.Title);
    await expect(this.screenDescriptionText).toBeDisplayed();
    await expect(this.screenDescriptionText).toHaveText(
      VerifySeedPhrase.Description
    );
    await expect(this.seedPhraseContainer).toBeDisplayed();
    await expect(this.continueButton).toBeExisting();
  }
}

export default new VerifySeedPhraseScreen();
