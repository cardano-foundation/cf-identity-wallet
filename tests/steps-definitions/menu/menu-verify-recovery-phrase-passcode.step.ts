import { When } from "@wdio/cucumber-framework";
import PasscodeScreen from "../../screen-objects/onboarding/passcode.screen";

When(
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
