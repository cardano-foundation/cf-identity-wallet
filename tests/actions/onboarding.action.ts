import { Given } from "@wdio/cucumber-framework";
import { faker } from "@faker-js/faker";
import { recoveryPhrase } from "../helpers/recovery-phrase.js";
import {
  generateRecoveryPhraseOf,
  recoveryPhraseWords,
} from "../steps-definitions/onboarding/verify-your-recovery-phrase.steps.js";
import AlertModal from "../screen-objects/components/alert.modal.js";
import Assert  from "../helpers/assert.js";
import CreatePasswordScreen from "../screen-objects/onboarding/create-password.screen.js";
import OnboardingScreen from "../screen-objects/onboarding/onboarding.screen.js";
import PasscodeScreen from "../screen-objects/onboarding/passcode.screen.js";
import SsiAgentDetailsScreen  from "../screen-objects/onboarding/ssi-agent-details.screen.js";
import VerifySeedPhraseScreen from "../screen-objects/onboarding/verify-your-recovery-phrase.screen.js";
import WelcomeModal  from "../screen-objects/components/welcome.modal.js";


Given(/^user is onboarded with skipped password creation$/, async function () {
  await OnboardingScreen.tapOnGetStartedButton();
  await PasscodeScreen.enterPasscode(
    (this.passcode = await PasscodeScreen.createAndEnterRandomPasscode())
  );
  await CreatePasswordScreen.skipButton.click();
  await AlertModal.clickConfirmButtonOf(CreatePasswordScreen.alertModal);
  await generateRecoveryPhraseOf();
  await recoveryPhrase().select(recoveryPhraseWords);
  await VerifySeedPhraseScreen.verifyButton.click();
  await SsiAgentDetailsScreen.tapOnValidatedButton();
  this.userName = faker.person.firstName();
  await WelcomeModal.nameInput.setValue(this.userName);
  await WelcomeModal.confirmButton.waitForClickable();
  await WelcomeModal.confirmButton.click();
  await Assert.toast(`Welcome, ${this.userName}!`)
});
