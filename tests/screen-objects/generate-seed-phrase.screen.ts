import { expect } from "expect-webdriverio"
const delay = (ms: number) => new Promise( resolve => setTimeout(resolve, ms));

export class GenerateSeedPhraseScreen {
  get continueButton () { return $("[data-testid=\"primary-button\"]") }
  get pageParagraphBottom () { return $("[data-testid=\"page-paragraph-bottom\"]") }
  get pageParagraphTop() { return $("[data-testid=\"page-paragraph-top\"]") }
  get phrase15WordsButton  () { return $("[data-testid=\"15-words-segment-button\"]") }
  get phrase24WordsButton  () { return $("[data-testid=\"24-words-segment-button\"]") }
  get screenTitle() { return $("[data-testid=\"screen-title\"]") }
  get termsAndConditionsCheckbox () { return $("[data-testid=\"termsandconditions-checkbox\"]") }
  get viewSeedPhraseButton () { return $("[data-testid=\"reveal-seed-phrase-button\"]") }
  get viewSeedPhraseText () { return $("[data-testid=\"seed-phrase-privacy-overlay\"]") }
  //get word1Text() { return $("[data-testid=\"continue-button\"]") }



  async screenLoads() {
    await expect(this.screenTitle).toBeExisting()
    await expect(this.pageParagraphTop).toBeDisplayed();
    await expect(this.phrase15WordsButton).toBeDisplayed();
    await expect(this.phrase24WordsButton).toBeDisplayed();
    await expect(this.viewSeedPhraseText).toBeDisplayed();
    await expect(this.viewSeedPhraseButton).toBeDisplayed();
    await expect(this.pageParagraphBottom).toBeDisplayed();
    await expect(this.termsAndConditionsCheckbox).toBeDisplayed();
    await expect(this.continueButton).toBeExisting();
  }
}

export default new GenerateSeedPhraseScreen();
