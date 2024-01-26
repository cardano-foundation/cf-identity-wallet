import { expect } from "expect-webdriverio";

export class TabBar {
  get credentialsTabButton() {
    return $("#tab-button-Credentials");
  }

  get cryptoTabButton() {
    return $("#tab-button-Crypto");
  }

  get identityTabButton() {
    return $("#tab-button-Identity");
  }

  get p2pChatTabButton() {
    return $("[data-testid=\"tab-button-p2p-chat\"]");
  }

  get scanTabButton() {
    return $("#tab-button-Scan");
  }

  async loads() {
    await expect(this.identityTabButton).toBeDisplayed();
    await expect(this.credentialsTabButton).toBeDisplayed();
    await expect(this.scanTabButton).toBeDisplayed();
    await expect(this.cryptoTabButton).toBeDisplayed();
    await expect(this.p2pChatTabButton).toBeDisplayed();
  }
}

export default new TabBar();
