import { expect } from "expect-webdriverio";
import { YourRecoveryPhrase } from "../../constants/text.constants.js";

export class YourRecoveryPhraseScreen {
  get alertModal() {
    return "[data-testid=\"seed-phrase-generate-alert-continue\"]";
  }

  get continueButton() {
    return $("[data-testid=\"primary-button-generate-seed-phrase\"]");
  }

  get id() {
    return "[data-testid=\"generate-onboarding-page\"]";
  }

  get recoveryPhraseButton() {
    return $("[data-testid=\"recovery-phrase-docs-btn\"]");
  }

  get recoveryPhraseContainerChildren() {
    return $$("//div[@data-testid=\"seed-phrase-container\"]/*");
  }

  get screenBottomParagraph() {
    return $("[data-testid=\"generate-seed-phrase-paragraph-bottom\"]");
  }

  get screenTitle() {
    return $("[data-testid=\"generate-seed-phrase-title\"]");
  }

  get switchToRecoveryWalletButton() {
    return $("[data-testid=\"tertiary-button-generate-seed-phrase\"]");
  }

  get termsAndConditionsCheckbox() {
    return $("[data-testid=\"terms-and-conditions-checkbox\"]");
  }

  get termsOfUseLink() {
    return $("[data-testid=\"terms-of-use-modal-handler\"]");
  }

  get viewRecoveryPhraseButton() {
    return $("[data-testid=\"reveal-seed-phrase-button\"]");
  }

  get viewRecoveryPhraseText() {
    return $("[data-testid=\"seed-phrase-privacy-overlay-text\"]");
  }

  get privacyPolicyLink() {
    return $("[data-testid=\"privacy-policy-modal-handler\"]");
  }

  async loads() {
    await expect(this.screenTitle).toBeExisting();
    await expect(this.screenTitle).toHaveText(YourRecoveryPhrase.Title);
    await expect(this.viewRecoveryPhraseText).toBeExisting();
    await expect(this.viewRecoveryPhraseButton).toBeExisting();
    await expect(this.recoveryPhraseButton).toBeExisting();
    await expect(this.screenBottomParagraph).toBeDisplayed();
    await expect(this.screenBottomParagraph).toHaveText(
      YourRecoveryPhrase.DescriptionBottom
    );
    await expect(this.termsAndConditionsCheckbox).toBeDisplayed();
    await expect(this.termsOfUseLink).toBeDisplayed();
    await expect(this.privacyPolicyLink).toBeDisplayed();
    await expect(this.continueButton).toBeExisting();
    await expect(this.switchToRecoveryWalletButton).toBeExisting();
  }
}

export default new YourRecoveryPhraseScreen();
