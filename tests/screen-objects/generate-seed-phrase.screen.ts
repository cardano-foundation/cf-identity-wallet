import { expect } from "expect-webdriverio";

export class GenerateSeedPhraseScreen {
  get cancelAlertButton () { return $("#cancel-alert-button") }
  get confirmAlertButton () { return $("#confirm-alert-button") }
  get continueButton () { return $("[data-testid=\"primary-button-generate-seed-phrase\"]") }
  get pageParagraphBottom () { return $("[data-testid=\"generate-seed-phrase-paragraph-bottom\"]") }
  get pageParagraphTop() { return $("[data-testid=\"generate-seed-phrase-paragraph-top\"]") }
  //seedPhraseContainerChildrenXpath =
  get seedPhraseContainerChildren() { return $$("//div[@data-testid=\"seed-phrase-container\"]/*") }
  get screenTitle() { return $("[data-testid=\"generate-seed-phrase-title\"]") }
  get termsAndConditionsCheckbox () { return $("[data-testid=\"terms-and-conditions-checkbox\"]") }
  get viewSeedPhraseButton () { return $("[data-testid=\"reveal-seed-phrase-button\"]") }
  get viewSeedPhraseText () { return $("[data-testid=\"seed-phrase-privacy-overlay-text\"]") }
  phraseWordsButton (phraseLength: number) { return $(`[data-testid="${phraseLength.toString()}-words-segment-button"]`) }
  seedPhraseWordText (wordNumber: number) { return $(`[data-testid="word-index-${wordNumber.toString()}"]`) }


  async screenLoads() {
    await expect(this.screenTitle).toBeExisting();
    await expect(this.pageParagraphTop).toBeDisplayed();
    await expect(this.phraseWordsButton(15)).toBeDisplayed();
    await expect(this.phraseWordsButton(24)).toBeDisplayed();
    await expect(this.viewSeedPhraseText).toBeDisplayed();
    await expect(this.viewSeedPhraseButton).toBeDisplayed();
    await expect(this.pageParagraphBottom).toBeDisplayed();
    await expect(this.termsAndConditionsCheckbox).toBeDisplayed();
    await expect(this.continueButton).toBeExisting();
  }
}

export default new GenerateSeedPhraseScreen();
