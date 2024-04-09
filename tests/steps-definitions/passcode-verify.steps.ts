import { When } from "@wdio/cucumber-framework";
import PasscodeScreen from "../screen-objects/passcode.screen.js";

When(/^user enter passcode on Verify Passcode screen$/, async function () {
  await PasscodeScreen.enterPasscode(
    this.passcode,
    "[data-testid=\"verify-passcode\"]"
  );
});
