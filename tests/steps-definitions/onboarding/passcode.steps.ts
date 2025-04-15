import { Given, Then, When } from "@wdio/cucumber-framework";
import PasscodeScreen from "../../screen-objects/onboarding/passcode.screen.js";
import { expect } from "expect-webdriverio";

Given(
  /^user enter a generated passcode on Passcode screen$/,
  async function () {
    this.passcode = await PasscodeScreen.createAndEnterRandomPasscode();
  }
);

Given(/^user generate passcode on Passcode screen$/, async function () {
  this.passcode = await PasscodeScreen.createAndEnterRandomPasscode();
  await PasscodeScreen.enterPasscode(this.passcode);
});

Given(/^user can see Re-enter your Passcode screen$/, async function () {
  await PasscodeScreen.loadsReEnterScreen();
});

When(/^user re-enter passcode on Passcode screen$/, async function () {
  await PasscodeScreen.enterPasscode(this.passcode);
});

When(
  /^user tap Can't remember button on Re-enter your Passcode screen$/,
  async function () {
    await PasscodeScreen.cantRememberButton.click();
  }
);

Then(/^user can see Passcode screen$/, async function () {
  await PasscodeScreen.loads();
});

Then(
  /^user can see (.*) on Passcode screen$/,
  async function (errorMessage: string) {
    await expect(await PasscodeScreen.errorMessageText.getText()).toMatch(
      errorMessage
    );
  }
);
