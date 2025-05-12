import { expect } from "expect-webdriverio";
import { VerifyYourRecoveryPhrase } from "../../constants/text.constants.js";
import { VerifyYourRecoveryPhraseScreen } from "../onboarding/verify-your-recovery-phrase.screen.js";

export class MenuVerifyYourRecoveryPhraseScreen extends VerifyYourRecoveryPhraseScreen {
  get screenDescriptionText() {
    return $('[data-testid="forgot-auth-info-paragraph-top"]');
  }

  get screenTitle() {
    return $('[data-testid="forgot-passcode-title"]');
  }

  get verifyButton() {
    return $('[data-testid="primary-button-forgot-auth-info"]');
  }

  async loads() {
    await expect(this.screenTitle).toBeDisplayed();
    await expect(this.screenTitle).toHaveText(
      VerifyYourRecoveryPhrase.MenuTitle
    );
    await expect(this.screenDescriptionText).toBeExisting();
    await expect(this.screenDescriptionText).toHaveText(
      VerifyYourRecoveryPhrase.MenuDescription
    );
    await expect(this.verifyButton).toBeExisting();
    await expect(this.verifyButton).toBeDisplayed();
  }
}

export default new MenuVerifyYourRecoveryPhraseScreen();
