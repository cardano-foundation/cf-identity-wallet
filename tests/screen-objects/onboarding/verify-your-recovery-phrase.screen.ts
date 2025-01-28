import { expect } from "expect-webdriverio";
import { VerifyYourRecoveryPhrase } from "../../constants/text.constants.js";

export class VerifyYourRecoveryPhraseScreen {
  get clearAllButton() {
    return $("[data-testid=\"verify-clear-button\"]");
  }

  get id() {
    return "[data-testid=\"verify-seed-phrase-page\"]";
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

  get switchToRecoveryWalletButton() {
    return $("[data-testid=\"tertiary-button-verify-seed-phrase\"]");
  }

  get verifyButton() {
    return $("[data-testid=\"primary-button-verify-seed-phrase\"]");
  }

  async loads() {
    await expect(this.screenTitle).toBeDisplayed();
    await expect(this.screenTitle).toHaveText(VerifyYourRecoveryPhrase.Title);
    await expect(this.screenDescriptionText).toBeExisting();
    await expect(this.screenDescriptionText).toHaveText(
      VerifyYourRecoveryPhrase.Description
    );
    await expect(this.seedPhraseContainer).toBeDisplayed();
    await expect(this.verifyButton).toBeExisting();
    await expect(this.switchToRecoveryWalletButton).toBeExisting();
  }
}

export default new VerifyYourRecoveryPhraseScreen();
