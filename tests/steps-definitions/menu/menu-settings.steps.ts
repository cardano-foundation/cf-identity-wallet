import { Then, When } from "@wdio/cucumber-framework";
import MenuSettingsScreen from "../../screen-objects/menu/menu-settings.screen.js";

Then(/^user can see Menu Settings screen$/, async function () {
  await MenuSettingsScreen.loads();
});

When(/^user tap on Change Passcode button on Menu screen$/, async function () {
  await MenuSettingsScreen.tapOnChangePasscodeButton();
});

When(
  /^user tap on Manage Operation Password button on Menu screen$/,
  async function () {
    await MenuSettingsScreen.tapOnOperationPasswordButton();
  }
);

When(/^user tap on Recovery Phrase button on Menu screen$/, async function () {
  await MenuSettingsScreen.tapOnRecoveryPhraseButton();
});
