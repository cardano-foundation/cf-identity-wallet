import { Given, When, Then } from "@wdio/cucumber-framework";
import { expect } from "expect-webdriverio"
import { seedPhrase } from "../helpers/seed-phrase.js";
import GenerateSeedPhraseScreen from "../screen-objects/generate-seed-phrase.screen.js";


export let seedPhraseWords: string [] = [];

Given(/^user choose and save (\d+) words seed phrase$/, async function (phraseLength) {
  await GenerateSeedPhraseScreen.phraseWordsButton(phraseLength).click();
  await GenerateSeedPhraseScreen.viewSeedPhraseButton.click();
  seedPhraseWords = await seedPhrase().save(phraseLength);
});

Given(/^tap agree to the Terms and Conditions checkbox on Generate Seed Phrase screen$/, async function () {
  await GenerateSeedPhraseScreen.termsAndConditionsCheckbox.click();
});

When(/^user tap Continue button Generate Seed Phrase screen$/, async function () {
  await GenerateSeedPhraseScreen.continueButton.click();
});

When(/^tap Cancel button on modal on Generate Seed Phrase screen$/, async function () {
  await GenerateSeedPhraseScreen.cancelAlertButton.click();
});

When(/^tap Confirm button on modal on Generate Seed Phrase screen$/, async function () {
  await GenerateSeedPhraseScreen.confirmAlertButton.click();
});

Then(/^user can see Generate Seed Phrase screen$/, async function() {
  await GenerateSeedPhraseScreen.screenLoads();
});

Then(/^user can see (\d+) words seed phrase list on Generate Seed Phrase screen$/, async function (phraseLength: number) {
  await expect(await GenerateSeedPhraseScreen.seedPhraseContainerChildren.length).toEqual(phraseLength);
});
