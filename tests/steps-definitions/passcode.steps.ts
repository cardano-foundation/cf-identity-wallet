import { Given, Then, When } from "@wdio/cucumber-framework";
import PasscodeScreen from "../screen-objects/passcode.screen.js";

let passcode: number[];

Given(
  /^user enter a generated passcode on Passcode screen$/,
  async function () {
    passcode = await PasscodeScreen.createAndEnterRandomPasscode();
  }
);

Given(/^user generate passcode on Passcode screen$/, async function () {
  passcode = await PasscodeScreen.createAndEnterRandomPasscode();
  await PasscodeScreen.enterPasscode(passcode);
});

Given(/^user can see Re-enter your Passcode screen$/, async function () {
  await PasscodeScreen.loadsReEnterScreen();
});

When(/^user re-enter passcode on Passcode screen$/, async function () {
  await PasscodeScreen.enterPasscode(passcode);
});

When(
  /^user tap Forgot your passcode button on Passcode screen$/,
  async function () {
    await PasscodeScreen.forgotYourPasscodeButton.click();
  }
);

Then(/^user can see Passcode screen$/, async function () {
  await PasscodeScreen.loads();
});
