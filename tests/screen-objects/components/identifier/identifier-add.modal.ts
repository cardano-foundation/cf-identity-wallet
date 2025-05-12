import { expect } from "expect-webdriverio";
import { CommonIdentifierModal } from "./common-identifier.modal.js";

export class IdentifierAddModal extends CommonIdentifierModal {
  get createIdentifierButton() {
    return $("[data-testid=\"primary-button-create-identifier-modal\"]");
  }

  get displayNameInput() {
    return this.displayNameInputElement("display");
  }

  get identifierTypeTitle() {
    return $(".type-input-title");
  }

  get id() {
    return this.idElement("create");
  }

  get modalTitle() {
    return this.modalTitleElement("add-an-identifier");
  }

  get cancelButton() {
    return $("[data-testid='close-button']");
  }

  async loads() {
    await expect(await this.id).toBeDisplayed();
    await expect(await this.modalTitle).toHaveText("Add an identifier");
    await expect(super.displayNameTitle).toHaveText("Display name");
    await expect(await this.displayNameInput).toBeDisplayed();
    await expect(this.identifierTypeTitle).toHaveText("Identifier type");
    await expect(await this.identifierTypeItem("default")).toBeDisplayed();
    await expect(await this.identifierTypeItem("multisig")).toBeDisplayed();
    await expect(await this.identifierTypeItem("delegated")).toBeDisplayed();
    await expect(super.colorTitle).toHaveText("Choose card colour");
    for (let i = 0; i <= 4; i++) {
      await expect(await super.colorItem(i)).toBeDisplayed();
    }
    await expect(super.themeTitle).toHaveText("Choose card style");
    for (let i = 0; i <= 3; i++) {
      await expect(await super.themeItem(i)).toBeDisplayed();
    }
    await expect(this.createIdentifierButton).toBeDisplayed();
  }
}

export default new IdentifierAddModal();
