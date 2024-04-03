import { Given } from "@wdio/cucumber-framework";
import { faker } from "@faker-js/faker";
import AlertModal from "../screen-objects/components/alert.modal.js";
import CreatePasswordScreen from "../screen-objects/create-password.screen.js";
import OnboardingScreen from "../screen-objects/onboarding.screen.js";
import PasscodeScreen from "../screen-objects/passcode.screen.js";
import { seedPhrase } from "../helpers/seed-phrase.js";
import {
  generateSeedPhraseOf,
  seedPhraseWords,
} from "../steps-definitions/seed-phrase-verify.steps.js";
import VerifySeedPhraseScreen from "../screen-objects/seed-phrase/seed-phrase-verify.screen.js";
import  WelcomeModal  from "../screen-objects/components/welcome.modal.js";
import  Assert  from "../helpers/assert.js";

Given(/^user is onboarded with skipped password creation$/, async function () {
  await OnboardingScreen.tapOnGetStartedButton();
  await PasscodeScreen.enterPasscode(
    (this.passcode = await PasscodeScreen.createAndEnterRandomPasscode())
  );
  await CreatePasswordScreen.skipButton.click();
  await AlertModal.clickConfirmButtonOf(CreatePasswordScreen.alertModal);
  await generateSeedPhraseOf(15);
  await seedPhrase().select(seedPhraseWords);
  await VerifySeedPhraseScreen.continueButton.click();
  this.userName = faker.person.firstName();
  await WelcomeModal.nameInput.setValue(this.userName);
  await WelcomeModal.confirmButton.click();
  await Assert.toast(`Welcome, ${this.userName}!`)
});
