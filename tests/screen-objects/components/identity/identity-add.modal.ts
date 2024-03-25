import { expect } from "expect-webdriverio";
import BaseModal from "../base.modal.js";

export class IdentityAddModal {
  get createIdentifierButton() {
    return $("[data-testid=\"primary-button-create-identifier-modal\"]");
  }

  get displayNameInput() {
    return $("#display-name-input > label > div > input");
  }

  get displayNameTitle() {
    return $("[data-testid=\"display-name-title\"]");
  }

  get identifierTypeTitle() {
    return $(".type-input-title");
  }

  get modalWindow() {
    return $("[data-testid=\"create-identifier-modal\"]");
  }

  get themeTitle() {
    return $(".theme-input-title");
  }

  get titleText() {
    return $("[data-testid=\"add-an-identifier-title\"]");
  }

  async identifierTypeItem(name: string) {
    return $(`[data-testid="identifier-type-${name.toLowerCase()}"]`);
  }

  async clickChosenIdentifierType(identifierType: string) {
    await (await this.identifierTypeItem(identifierType)).click();
  }

  async themeItem(index: number) {
    return $(`[data-testid="identifier-theme-selector-item-${index}"]`);
  }

  async clickChosenTheme(index: number) {
    await (await this.themeItem(index)).click();
  }

  async loads() {
    await expect(this.modalWindow).toBeDisplayed();
    await expect(await BaseModal.doneButton).toBeDisplayed();
    await expect(this.titleText).toHaveText("Add an identifier");
    await expect(this.displayNameTitle).toHaveText("Display name");
    await expect(this.displayNameInput).toBeDisplayed();
    await expect(this.identifierTypeTitle).toHaveText("Identifier type");
    await expect(this.identifierTypeItem("DIDKEY")).toBeDisplayed();
    await expect(this.identifierTypeItem("KERI")).toBeDisplayed();
    await expect(this.themeTitle).toHaveText("Choose a theme");
    for (let i = 0; i < 4; i++) {
      await expect(this.themeItem(i)).toBeDisplayed();
    }
    await expect(this.createIdentifierButton).toBeDisplayed();
  }
}

export default new IdentityAddModal();
