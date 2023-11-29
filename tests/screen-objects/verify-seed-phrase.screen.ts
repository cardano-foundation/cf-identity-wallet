import { expect } from "expect-webdriverio"

export class VerifySeedPhraseScreen {
  get seedPhraseContainer () { return $("[data-testid=\"matching-seed-phrase-container\"]") }

  async screenLoads() {
    await expect(this.seedPhraseContainer).toBeDisplayed();
  }
}

export default new VerifySeedPhraseScreen();
