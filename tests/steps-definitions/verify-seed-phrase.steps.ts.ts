import { Then } from "@wdio/cucumber-framework";
import VerifySeedPhraseScreen from "../screen-objects/verify-seed-phrase.screen.js";

Then(/^user can see Verify Seed Phrase screen$/, async function () {
  await VerifySeedPhraseScreen.screenLoads();
});
