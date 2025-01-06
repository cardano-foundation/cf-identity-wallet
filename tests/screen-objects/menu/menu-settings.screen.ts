import { expect } from "expect-webdriverio";

export class MenuSettingsScreen {

  get appVersionItem() {
    return $("[data-testid=\"settings-item-app-version\"]");
  }

  get biometricAuthenticationItem() {
    return $("[data-testid=\"settings-item-biometric-authentication\"]");
  }

  get changePasscodeItem() {
    return $("[data-testid=\"settings-item-change-passcode\"]");
  }

  get connectViaDiscordItem() {
    return $("[data-testid=\"settings-item-connect-via-discord\"]");
  }

  get learnMoreItem() {
    return $("[data-testid=\"settings-item-learn-more-about-cardano-idw\"]");
  }

  get manageOperationsPasswordItem() {
    return $("[data-testid=\"settings-item-manage-operations-password\"]");
  }

  get recoveryPhraseItem() {
    return $("[data-testid=\"settings-item-recovery-phrase\"]");
  }

  get termsAndPrivacyPolicyItem() {
    return $("[data-testid=\"settings-item-terms-and-privacy-policy\"]");
  }

  async loads() {
    await expect(this.biometricAuthenticationItem).toBeDisplayed();
    await expect(this.changePasscodeItem).toBeDisplayed();
    await expect(this.manageOperationsPasswordItem).toBeDisplayed();
    await expect(this.recoveryPhraseItem).toBeDisplayed();
    await expect(this.learnMoreItem).toBeDisplayed();
    await expect(this.termsAndPrivacyPolicyItem).toBeDisplayed();
    await expect(this.connectViaDiscordItem).toBeDisplayed();
    await expect(this.appVersionItem).toBeDisplayed();
  }
}

export default new MenuSettingsScreen();
