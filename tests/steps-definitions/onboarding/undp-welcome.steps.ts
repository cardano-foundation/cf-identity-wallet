import { Given, Then, When } from "@wdio/cucumber-framework";
import UNDPWelcomeScreen from "../../screen-objects/onboarding/undp-welcome.screen";
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
import IdentifierAddModal from "../../screen-objects/components/identifier/identifier-add.modal";

Given(/^user is onboarded with skipped password creation successful$/, async function() {
  await OnboardingScreen.tapOnGetStartedButton();
  await PasscodeScreen.enterPasscode(
    (this.passcode = await PasscodeScreen.createAndEnterRandomPasscode())
  );
  if (await BiometricScreen.biometricWarningText.isExisting()) {
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
  await UNDPWelcomeScreen.loads(`Welcome, ${this.userName}`);
});

Given(/^user tap Add and Identifier button on Welcome message$/, async function() {
  await UNDPWelcomeScreen.addIdentifierButton.click();
});

Then(/^user can see toast message about created identifier$/, async function() {
  await UNDPWelcomeScreen.pendingToast();
  await UNDPWelcomeScreen.createdToast();
});

When(/^user tap Cancel button on Add and Identifier screen$/, async function() {
  await IdentifierAddModal.cancelButton.click();
});

Given(/^user tap Skip button on Welcome message$/, async function() {
  await UNDPWelcomeScreen.handleSkipUNDPScreen();
  await UNDPWelcomeScreen.welcomeScreenInvisible();
});