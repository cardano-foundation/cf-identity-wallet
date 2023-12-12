import { expect } from "expect-webdriverio";
import { findAndClickElement } from "../base.screen.js";

export class MenuToolbar {
  get addButton() {
    return $("[data-testid=\"add-button\"]");
  }

  get connectionsButton() {
    return $("[data-testid=\"connections-button\"]");
  }

  get menusButton() {
    return $("[data-testid=\"menu-button\"]");
  }

  async clickBackArrowIcon() {
    await findAndClickElement("[data-testid=\"back-button\"]");
  }

  async loads() {
    await expect(this.addButton).toBeDisplayed();
    await expect(this.connectionsButton).toBeDisplayed();
    await expect(this.menusButton).toBeDisplayed();
  }
}

export default new MenuToolbar();
