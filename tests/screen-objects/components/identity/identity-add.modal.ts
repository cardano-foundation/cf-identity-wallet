import { expect } from "expect-webdriverio";
import { CommonIdentityModal } from "./common-identity.modal.js";

export class IdentityAddModal extends CommonIdentityModal {
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

  async loads() {
    await expect(this.id).toBeDisplayed();
    await expect(this.modalTitle).toHaveText("Add an identifier");
    await expect(super.displayNameTitle).toHaveText("Display name");
    await expect(this.displayNameInput).toBeDisplayed();
    await expect(this.identifierTypeTitle).toHaveText("Identifier type");
    await expect(this.identifierTypeItem("DIDKEY")).toBeDisplayed();
    await expect(this.identifierTypeItem("KERI")).toBeDisplayed();
    await expect(super.themeTitle).toHaveText("Choose a theme");
    for (let i = 0; i < 4; i++) {
      await expect(super.themeItem(i)).toBeDisplayed();
    }
    await expect(this.createIdentifierButton).toBeDisplayed();
  }
}

export default new IdentityAddModal();
