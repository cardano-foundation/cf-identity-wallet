import {Given, Then } from "@wdio/cucumber-framework";
import OnboardingAddingIdentifierWelcomeScreen from "../../screen-objects/onboarding/onboarding-adding-identifier-welcome.screen";
import { generateRecoveryPhraseOf, recoveryPhraseWords } from "./verify-your-recovery-phrase.steps";
import { recoveryPhrase } from "../../helpers/recovery-phrase";
import VerifySeedPhraseScreen from "../../screen-objects/onboarding/verify-your-recovery-phrase.screen";
import { faker } from "@faker-js/faker";
import OnboardingScreen from "../../screen-objects/onboarding/onboarding.screen";
import PasscodeScreen from "../../screen-objects/onboarding/passcode.screen";
import BiometricScreen from "../../screen-objects/onboarding/biometric.screen";
import CreatePasswordScreen from "../../screen-objects/onboarding/create-password.screen";
import AlertModal from "../../screen-objects/components/alert.modal";
import SsiAgentDetailsScreen from "../../screen-objects/onboarding/ssi-agent-details.screen";
import WelcomeModal from "../../screen-objects/components/welcome.modal";

Given(/^user is onboarded with skipped password creation successful$/, async function() {
  await OnboardingScreen.tapOnGetStartedButton();
  await PasscodeScreen.enterPasscode(
    (this.passcode = await PasscodeScreen.createAndEnterRandomPasscode())
  );
  if (await BiometricScreen.biometricWarningText.isDisplayed()) {
    await BiometricScreen.handleBiometricPopup();
  }
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
});

Then(/^user can see Welcome message$/, async function () {
  await OnboardingAddingIdentifierWelcomeScreen.loadTitleText(`Welcome, ${this.userName}`);
  await OnboardingAddingIdentifierWelcomeScreen.loadWelcomeText();
});
Given(/^user tap Add and Identifier button on Welcome message$/, async function() {
  await OnboardingAddingIdentifierWelcomeScreen.addIdentifierButton.click();
});