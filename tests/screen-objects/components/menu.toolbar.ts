import { expect } from "expect-webdriverio";
import {
  findAndClickLocator,
  findFilterAndClickElement,
} from "../base.screen.js";

export class MenuToolbar {
  backArrowButtonLocator = "[data-testid=\"back-button\"]";

  get addButton() {
    return $("[data-testid=\"add-button\"]");
  }

  get connectionsButton() {
    return $("[data-testid=\"connections-button\"]");
  }

  async menusButton(screenLocator: string) {
    return $(`[data-testid="menu-button-${screenLocator}"]`);
  }

  async clickBackArrowButtonOf(parent: string) {
    await findAndClickLocator(`${parent} ${this.backArrowButtonLocator}`);
  }

  async clickBackArrowIcon() {
    await findFilterAndClickElement(this.backArrowButtonLocator);
  }

  async loads() {
    await expect(this.addButton).toBeDisplayed();
    await expect(this.connectionsButton).toBeDisplayed();
  }
}

export default new MenuToolbar();
