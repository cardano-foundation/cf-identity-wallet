import { Given, When } from "@wdio/cucumber-framework";
import MenuToolbar from "../screen-objects/components/menu.toolbar.js";
import PasscodeScreen from "../screen-objects/passcode.screen.js";
import SeedPhraseVerifyScreen from "../screen-objects/seed-phrase/seed-phrase-verify.screen.js";
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
  /^user tap Back button on Seed Phrase Verify screen$/,
  async function () {
    await BaseModal.clickCloseButtonOf(SeedPhraseVerifyScreen.id);
  }
);
