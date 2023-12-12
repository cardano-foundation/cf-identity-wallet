import { Given, Then, When } from "@wdio/cucumber-framework";
import { seedPhrase } from "../helpers/seed-phrase.js";
import AlertModal from "../screen-objects/components/alert.modal.js";
import GenerateSeedPhraseScreen from "../screen-objects/generate-seed-phrase.screen.js";
import VerifySeedPhraseScreen from "../screen-objects/verify-seed-phrase.screen.js";

export let seedPhraseWords: string[] = [];

Given(
  /^user continue after choose and save (\d+) words seed phrase$/,
  async function (phraseLength) {
    await GenerateSeedPhraseScreen.phraseWordsButton(phraseLength).click();
    await GenerateSeedPhraseScreen.viewSeedPhraseButton.click();
    seedPhraseWords = await seedPhrase().save(phraseLength);
    await GenerateSeedPhraseScreen.termsAndConditionsCheckbox.click();
    await GenerateSeedPhraseScreen.continueButton.click();
    await AlertModal.clickConfirmAlertButton();
    await VerifySeedPhraseScreen.loads();
  }
);

When(
  /^user select words from his seed phrase on Verify Seed Phrase screen$/,
  async function () {
    await seedPhrase().select(seedPhraseWords);
  }
);

When(
  /^user tap Continue button on Verify Seed Phrase screen$/,
  async function () {
    await VerifySeedPhraseScreen.continueButton.click();
  }
);

Then(/^user can see Verify Seed Phrase screen$/, async function () {
  await VerifySeedPhraseScreen.loads();
});
