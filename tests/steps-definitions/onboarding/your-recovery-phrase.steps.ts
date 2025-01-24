import { Given, Then, When } from "@wdio/cucumber-framework";
import { expect } from "expect-webdriverio";
import { recoveryPhrase } from "../../helpers/recovery-phrase.js";
import YourRecoveryPhraseScreen from "../../screen-objects/onboarding/your-recovery-phrase.screen.js";

export let seedPhraseWords: string[] = [];

Given(
  /^user choose and save words seed phrase$/,
  async function () {
    await YourRecoveryPhraseScreen.viewRecoveryPhraseButton.click();
    seedPhraseWords = await recoveryPhrase().save();
  }
);

Given(
  /^tap agree to the Terms and Conditions checkbox on Your Recovery Phrase screen$/,
  async function () {
    await YourRecoveryPhraseScreen.termsAndConditionsCheckbox.click();
  }
);

Given(
  /^user tap Terms of Use link on Your Recovery Phrase screen$/,
  async function () {
    await YourRecoveryPhraseScreen.termsOfUseLink.click();
  }
);

Given(
  /^user tap Privacy Policy link on Your Recovery Phrase screen$/,
  async function () {
    await YourRecoveryPhraseScreen.privacyPolicyLink.click();
  }
);

Given(
  /^user tap View Recovery Phrase button on Your Recovery Phrase screen$/,
  async function () {
    await YourRecoveryPhraseScreen.viewRecoveryPhraseButton.click();
  }
);

When(
  /^user tap Continue button Your Recovery Phrase screen$/,
  async function () {
    await YourRecoveryPhraseScreen.continueButton.scrollIntoView();
    await YourRecoveryPhraseScreen.continueButton.click();
  }
);

Then(/^user can see Your Recovery Phrase screen$/, async function () {
  await YourRecoveryPhraseScreen.loads();
});

Then(
  /^user can see (\d+) words seed phrase list on Your Recovery Phrase screen$/,
  async function (phraseLength: number) {
    await expect(
      await YourRecoveryPhraseScreen.recoveryPhraseContainerChildren.length
    ).toEqual(phraseLength);
  }
);
