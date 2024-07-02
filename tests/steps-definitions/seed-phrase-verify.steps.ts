import { Given, Then, When } from "@wdio/cucumber-framework";
import { seedPhrase } from "../helpers/seed-phrase.js";
import AlertModal from "../screen-objects/components/alert.modal.js";
import SeedPhraseGenerateScreen from "../screen-objects/seed-phrase/seed-phrase-generate.screen.js";
import SeedPhraseVerifyScreen from "../screen-objects/seed-phrase/seed-phrase-verify.screen.js";

export let seedPhraseWords: string[] = [];

export async function generateSeedPhraseOf() {
  await SeedPhraseGenerateScreen.viewSeedPhraseButton.click();
  seedPhraseWords = await seedPhrase().save();
  await SeedPhraseGenerateScreen.termsAndConditionsCheckbox.click();
  await SeedPhraseGenerateScreen.continueButton.scrollIntoView();
  await SeedPhraseGenerateScreen.continueButton.click();
  await AlertModal.clickConfirmButtonOf(SeedPhraseGenerateScreen.alertModal);
  await SeedPhraseVerifyScreen.loads();
}

Given(/^user Seed Phrase Verify$/, async function () {
  await generateSeedPhraseOf();
  await seedPhrase().select(seedPhraseWords);
  await SeedPhraseVerifyScreen.continueButton.click();
});

Given(
  /^user continue after choose and save (\d+) words seed phrase$/,
  async function () {
    await generateSeedPhraseOf();
  }
);

When(
  /^user select words from his seed phrase on Seed Phrase Verify screen$/,
  async function () {
    await seedPhrase().select(seedPhraseWords);
  }
);

When(
  /^user tap Continue button on Seed Phrase Verify screen$/,
  async function () {
    await SeedPhraseVerifyScreen.continueButton.click();
  }
);

Then(/^user can see Seed Phrase Verify screen$/, async function () {
  await SeedPhraseVerifyScreen.loads();
});
