import { When } from "@wdio/cucumber-framework";
import PasscodeScreen from "../screen-objects/onboarding/passcode.screen";
import EnterPasswordModal from "../screen-objects/components/enter-password.modal";

When(
  /^user successfully confirmed recovery phrase and passcode flow on Verify Your Recovery Phrase screen with password enable$/,
  async function () {
    await EnterPasswordModal.passwordInput.addValue(
      (global as any).generatedPassword
    );
    await EnterPasswordModal.tapOnConfirmButton();
    this.passcode =
      await PasscodeScreen.createAndEnterRandomPasscodeWithParentElement(
        '[data-testid="change-pin-modal"]'
      );
    await PasscodeScreen.enterPasscode(
      this.passcode,
      '[data-testid="change-pin-modal"]'
    );
  }
);
