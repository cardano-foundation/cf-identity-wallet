import { Given, When } from "@wdio/cucumber-framework";
import MenuToolbar from "../screen-objects/components/menu.toolbar.js";
import PasscodeScreen from "../screen-objects/onboarding/passcode.screen.js";
import VerifyYourRecoveryPhraseScreen from "../screen-objects/onboarding/verify-your-recovery-phrase.screen.js";
import BaseModal from "../screen-objects/components/base.modal.js";

Given(
  /^user tap (Add|Plus) button on the screen$/,
  async function (dummy: string) {
    await MenuToolbar.addButton.click();
  }
);

Given(/^user tap Back arrow icon on the screen$/, async function () {
  await MenuToolbar.clickBackArrowIcon();
});

Given(/^user tap Cancel button on Passcode screen$/, async function () {
  await BaseModal.clickCloseButtonOf(PasscodeScreen.id);
});

When(/^user tap Back button on Re-enter your Passcode screen$/, async function () {
  await BaseModal.clickCloseButtonOf(PasscodeScreen.id);
});

When(
  /^user tap Back button on Verify Your Recovery Phrase screen$/,
  async function () {
    await BaseModal.clickCloseButtonOf(VerifyYourRecoveryPhraseScreen.id);
  }
);
