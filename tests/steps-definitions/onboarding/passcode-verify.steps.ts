import {Then, When} from "@wdio/cucumber-framework";
import PasscodeScreen from "../../screen-objects/onboarding/passcode.screen.js";
import {expect} from "expect-webdriverio";

When(/^user enter passcode on Verify Passcode screen$/, async function () {
  await PasscodeScreen.enterPasscode(
    this.passcode,
    "[data-testid=\"verify-passcode\"]"
  );
});

When(/^user enter generated passcode on Verify Passcode screen$/, async function () {
   await PasscodeScreen.createAndEnterRandomPasscode();
});
