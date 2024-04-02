import { Given, Then, When } from "@wdio/cucumber-framework";
import { expect } from "expect-webdriverio";
import { seedPhrase } from "../helpers/seed-phrase.js";
import SeedPhraseGenerateScreen from "../screen-objects/seed-phrase/seed-phrase-generate.screen.js";

export let seedPhraseWords: string[] = [];

Given(
  /^user choose and save (\d+) words seed phrase$/,
  async function (phraseLength) {
    await SeedPhraseGenerateScreen.phraseWordsButton(phraseLength).click();
    await SeedPhraseGenerateScreen.viewSeedPhraseButton.click();
    seedPhraseWords = await seedPhrase().save(phraseLength);
  }
);

Given(
  /^tap agree to the Terms and Conditions checkbox on Seed Phrase Generate screen$/,
  async function () {
    await SeedPhraseGenerateScreen.termsAndConditionsCheckbox.click();
  }
);

Given(
  /^user tap Terms of Use link on Seed Phrase Generate screen$/,
  async function () {
    await SeedPhraseGenerateScreen.termsOfUseLink.click();
  }
);

Given(
  /^user tap Privacy Policy link on Seed Phrase Generate screen$/,
  async function () {
    await SeedPhraseGenerateScreen.privacyPolicyLink.click();
  }
);

When(
  /^user tap Continue button Seed Phrase Generate screen$/,
  async function () {
    await SeedPhraseGenerateScreen.continueButton.scrollIntoView();
    await SeedPhraseGenerateScreen.continueButton.click();
  }
);

Then(/^user can see Seed Phrase Generate screen$/, async function () {
  await SeedPhraseGenerateScreen.loads();
});

Then(
  /^user can see (\d+) words seed phrase list on Seed Phrase Generate screen$/,
  async function (phraseLength: number) {
    await expect(
      await SeedPhraseGenerateScreen.seedPhraseContainerChildren.length
    ).toEqual(phraseLength);
  }
);
