import { expect } from "expect-webdriverio";

export class TabBar {
  get credentialsTabButton() {
    return $("#tab-button-Credentials");
  }

  get identityTabButton() {
    return $("#tab-button-Identity");
  }

  get menuTabButton() {
    return $("#tab-button-Menu");
  }

  get p2pChatTabButton() {
    return $("#tab-button-P2P");
  }

  get scanTabButton() {
    return $("#tab-button-Scan");
  }

  async loads() {
    await expect(this.identityTabButton).toBeDisplayed();
    await expect(this.credentialsTabButton).toBeDisplayed();
    await expect(this.scanTabButton).toBeDisplayed();
    await expect(this.p2pChatTabButton).toBeDisplayed();
    await expect(this.menuTabButton).toBeDisplayed();
  }
}

export default new TabBar();
