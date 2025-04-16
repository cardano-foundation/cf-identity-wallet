import { Given } from "@wdio/cucumber-framework";
import PasscodeScreen from "../onboarding/passcode.screen";

Given(
  /^user generate passcode on Passcode screen from Verify Your Recovery Phrase screen$/,
  async function () {
    this.passcode =
      await PasscodeScreen.createAndEnterRandomPasscodeWithParentElement(
        '[data-testid="forgot-auth-info-modal"]'
      );
    await PasscodeScreen.enterPasscode(
      this.passcode,
      '[data-testid="forgot-auth-info-modal"]'
    );
  }
);
