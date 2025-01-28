import { expect } from "expect-webdriverio";
import { CommonIdentifierModal } from "./common-identifier.modal.js";

export class IdentifierEditModal extends CommonIdentifierModal {
  modalName = "edit";

  get confirmChangesButton() {
    return $("[data-testid=\"primary-button-edit-identifier\"]");
  }

  get displayNameInput() {
    return this.displayNameInputElement(this.modalName);
  }

  get id() {
    return this.idElement(this.modalName);
  }

  get idLocator() {
    return this.getIdElementLocator(this.modalName);
  }

  get modalTitle() {
    return this.modalTitleElement(`${this.modalName}-identifier`);
  }

  async loads() {
    await expect(this.id).toBeDisplayed();
    await expect(this.modalTitle).toHaveText("Edit identifier");
    await expect(super.displayNameTitle).toHaveText("Display name");
    await expect(this.displayNameInput).toBeDisplayed();
    await expect(this.themeTitle).toHaveText("Edit theme");
    for (let i = 0; i < 4; i++) {
      await expect(this.themeItem(i)).toBeDisplayed();
    }
    await expect(this.confirmChangesButton).toBeDisplayed();
  }
}

export default new IdentifierEditModal();
