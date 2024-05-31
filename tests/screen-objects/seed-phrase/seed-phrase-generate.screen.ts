import { expect } from "expect-webdriverio";
import { SeedPhraseGenerate } from "../../constants/text.constants.js";

export class SeedPhraseGenerateScreen {
  get alertModal() {
    return "[data-testid=\"seed-phrase-generate-alert-continue\"]";
  }

  get continueButton() {
    return $("[data-testid=\"primary-button-generate-seed-phrase\"]");
  }

  get id() {
    return "[data-testid=\"generate-seed-phrase-page\"]";
  }

  get screenBottomParagraph() {
    return $("[data-testid=\"generate-seed-phrase-paragraph-bottom\"]");
  }

  get screenTitle() {
    return $("[data-testid=\"generate-seed-phrase-title\"]");
  }

  get screenTopParagraph() {
    return $("[data-testid=\"generate-seed-phrase-paragraph-top\"]");
  }

  get seedPhraseContainerChildren() {
    return $$("//div[@data-testid=\"seed-phrase-container\"]/*");
  }

  get termsAndConditionsCheckbox() {
    return $("[data-testid=\"terms-and-conditions-checkbox\"]");
  }

  get termsOfUseLink() {
    return $("[data-testid=\"terms-of-use-modal-handler\"]");
  }

  get viewSeedPhraseButton() {
    return $("[data-testid=\"reveal-seed-phrase-button\"]");
  }

  get viewSeedPhraseText() {
    return $("[data-testid=\"seed-phrase-privacy-overlay-text\"]");
  }

  get privacyPolicyLink() {
    return $("[data-testid=\"privacy-policy-modal-handler\"]");
  }

  phraseWordsButton(phraseLength: number) {
    return $(`[data-testid="${phraseLength.toString()}-words-segment-button"]`);
  }

  async loads() {
    await expect(this.screenTitle).toBeExisting();
    await expect(this.screenTitle).toHaveText(SeedPhraseGenerate.Title);
    await expect(this.screenTopParagraph).toBeDisplayed();
    await expect(this.screenTopParagraph).toHaveText(
      SeedPhraseGenerate.DescriptionTop
    );
    await expect(this.phraseWordsButton(15)).toBeDisplayed();
    await expect(this.phraseWordsButton(24)).toBeDisplayed();
    await expect(this.viewSeedPhraseText).toBeExisting();
    await expect(this.viewSeedPhraseButton).toBeExisting();
    await expect(this.screenBottomParagraph).toBeDisplayed();
    await expect(this.screenBottomParagraph).toHaveText(
      SeedPhraseGenerate.DescriptionBottom
    );
    await expect(this.termsAndConditionsCheckbox).toBeDisplayed();
    await expect(this.termsOfUseLink).toBeDisplayed();
    await expect(this.privacyPolicyLink).toBeDisplayed();
    await expect(this.continueButton).toBeExisting();
  }
}

export default new SeedPhraseGenerateScreen();
