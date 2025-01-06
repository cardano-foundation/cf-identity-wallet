import { expect } from "expect-webdriverio";

export class MenuScreen {

  get cardanoConnectItem() {
    return $("[data-testid=\"menu-input-item-Cardano connect\"]");
  }

  get chatItem() {
    return $("[data-testid=\"menu-input-item-Chat\"]");
  }

  get connectionsItem() {
    return $("[data-testid=\"menu-input-item-Connections\"]");
  }

  get cryptoItem() {
    return $("[data-testid=\"menu-input-item-Crypto\"]");
  }

  get profileItem() {
    return $("[data-testid=\"menu-input-item-Profile\"]");
  }

  get settingsButton() {
    return $("[data-testid=\"settings-button\"]");
  }


  async tapOnSettingsButton() {
    await expect(this.settingsButton).toBeDisplayed();
    await expect(this.settingsButton).toBeEnabled();
    await this.settingsButton.click();
  }

  async loads() {
    await expect(this.settingsButton).toBeDisplayed();
    await expect(this.profileItem).toBeDisplayed();
    await expect(this.cryptoItem).toBeDisplayed();
    await expect(this.connectionsItem).toBeDisplayed();
    await expect(this.cardanoConnectItem).toBeDisplayed();
    await expect(this.chatItem).toBeDisplayed();
  }
}

export default new MenuScreen();
