import { expect } from "expect-webdriverio";

export class MenuSettingsSupportScreen {
  get termsOfUseItem() {
    return $("[data-testid='terms-modal-btn']");
  }

  get privacyPolicyItem() {
    return $("[data-testid='privacy-modal-btn']");
  }

  get backButton() {
    return $("[data-testid='sub-menu term-and-privacy-page'] [data-testid='close-button']");
  }

  get doneButton() {
    return $("[data-testid='privacy-policy-modal-content-page'] [data-testid='close-button']");
  }

  async loadsTermsAndPrivacyScreen() {
    await this.termsOfUseItem.waitForDisplayed();
    await expect(this.termsOfUseItem).toBeDisplayed();
    await this.privacyPolicyItem.waitForDisplayed();
    await expect(this.privacyPolicyItem).toBeDisplayed();
  }

}
export default new MenuSettingsSupportScreen();