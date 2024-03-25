import { Given, Then, When } from "@wdio/cucumber-framework";
import { seedPhrase } from "../helpers/seed-phrase.js";
import AlertModal from "../screen-objects/components/alert.modal.js";
import GenerateSeedPhraseScreen from "../screen-objects/seed-phrase/seed-phrase-generate.screen.js";
import VerifySeedPhraseScreen from "../screen-objects/seed-phrase/seed-phrase-verify.screen.js";

export let seedPhraseWords: string[] = [];

export async function generateSeedPhraseOf(phraseLength: number) {
  await GenerateSeedPhraseScreen.phraseWordsButton(phraseLength).click();
  await GenerateSeedPhraseScreen.viewSeedPhraseButton.click();
  seedPhraseWords = await seedPhrase().save(phraseLength);
  await GenerateSeedPhraseScreen.termsAndConditionsCheckbox.click();
  await GenerateSeedPhraseScreen.continueButton.click();
  await AlertModal.clickConfirmButton();
  await VerifySeedPhraseScreen.loads();
}

Given(/^user verify seed phrase$/, async function () {
  await generateSeedPhraseOf(15);
  await seedPhrase().select(seedPhraseWords);
  await VerifySeedPhraseScreen.continueButton.click();
});

Given(
  /^user continue after choose and save (\d+) words seed phrase$/,
  async function (phraseLength: number) {
    await generateSeedPhraseOf(phraseLength);
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
