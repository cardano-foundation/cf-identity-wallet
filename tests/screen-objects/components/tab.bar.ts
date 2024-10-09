import { expect } from "expect-webdriverio";

export class TabBar {
  get credentialsTabButton() {
    return $("#tab-button-Credentials");
  }

  get identityTabButton() {
    return $("#tab-button-Identifiers");
  }

  get menuTabButton() {
    return $("#tab-button-Menu");
  }

  get notificationsTabButton() {
    return $("#tab-button-Notifications");
  }

  get scanTabButton() {
    return $("#tab-button-Scan");
  }

  async loads() {
    await expect(this.identityTabButton).toBeDisplayed();
    await expect(this.credentialsTabButton).toBeDisplayed();
    await expect(this.scanTabButton).toBeDisplayed();
    await expect(this.notificationsTabButton).toBeDisplayed();
    await expect(this.menuTabButton).toBeDisplayed();
  }
}

export default new TabBar();
