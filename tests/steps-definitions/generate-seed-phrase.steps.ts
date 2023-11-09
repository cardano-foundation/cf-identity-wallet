import { Then } from "@wdio/cucumber-framework";
import GenerateSeedPhraseScreen from "../screen-objects/generate-seed-phrase.screen.js";

Then(/^user can see Generate Seed Phrase screen$/, async function() {
  await GenerateSeedPhraseScreen.screenLoads()
});
