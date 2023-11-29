import { Given, When, Then } from "@wdio/cucumber-framework";
import PasscodeScreen from "../screen-objects/passcode.screen.js";

let passcode: number[];

Given(/^user enter a generated passcode on Passcode screen$/, async function() {
  passcode = await PasscodeScreen.createAndEnterRandomPasscode();
});

Given(/^user tap Back arrow icon on Passcode screen$/, async function () {
  await PasscodeScreen.backArrowIcon.click();
});

Given(/^user generate passcode on Passcode screen$/, async function () {
  passcode = await PasscodeScreen.createAndEnterRandomPasscode();
  await PasscodeScreen.enterPasscode(passcode);
});

When(/^user re-enter passcode on Passcode screen$/, async function() {
  await PasscodeScreen.enterPasscode(passcode);
});

When(/^user tap I cant remember, can I start over button on Passcode screen$/, async function() {
  await PasscodeScreen.forgotYourPasscodeButton.click();
});

Then(/^user can see Passcode screen$/, async function () {
  await PasscodeScreen.screenLoads();
});
