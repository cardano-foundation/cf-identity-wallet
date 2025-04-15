import { expect } from "expect-webdriverio";

export class MenuScreen {

  get cardanoConnectItem() {
    return $("[data-testid=\"menu-input-item-4\"]");
  }

  get connectionsItem() {
    return $("[data-testid=\"menu-input-item-3\"]");
  }

  get profileItem() {
    return $("[data-testid=\"menu-input-item-1\"]");
  }

  get settingsButton() {
    return $("[data-testid=\"settings-button\"]");
  }


  async tapOnSettingsButton() {
    await expect(this.settingsButton).toBeDisplayed();
    await expect(this.settingsButton).toBeEnabled();
    await this.settingsButton.click();
  }

  async tapOnProfileButton() {
    await expect(this.profileItem).toBeDisplayed();
    await expect(this.profileItem).toBeEnabled();
    await this.profileItem.click();
  }

  async loads() {
    await expect(this.settingsButton).toBeDisplayed();
    await expect(this.profileItem).toBeDisplayed();
    await expect(this.connectionsItem).toBeDisplayed();
    await expect(this.cardanoConnectItem).toBeDisplayed();
  }
}

export default new MenuScreen();
