import { expect } from "expect-webdriverio";
import { driver } from "@wdio/globals";
import { log } from "../../helpers/logger";

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

  get componentsText() {
    return $("h2#components");
  }

  async loadsTermsAndPrivacyScreen() {
    await this.termsOfUseItem.waitForDisplayed();
    await expect(this.termsOfUseItem).toBeDisplayed();
    await this.privacyPolicyItem.waitForDisplayed();
    await expect(this.privacyPolicyItem).toBeDisplayed();
  }

  async checkComponentsText() {
    await this.componentsText.waitForDisplayed();
    await expect(this.componentsText).toHaveText("Components");
  }

  async navigationToNewTab() {
    const contexts = await driver.getContexts();
    log.info(`Contexts: ${contexts}`);
    await driver.switchContext("WEBVIEW_org.cardanofoundation.idw");
    await driver.switchContext("WEBVIEW_chrome");
  }

  async checkTitle(titleText: string) {
    const title = await driver.getTitle();
    expect(title).toHaveText(titleText);
  }
}
export default new MenuSettingsSupportScreen();