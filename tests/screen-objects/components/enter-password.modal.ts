import { BaseModal } from "./base.modal.js";
import { expect } from "expect-webdriverio";

export class EnterPasswordModal extends BaseModal {
  get confirmButton() {
    return $('[data-testid="action-button"]');
  }

  get passwordInput() {
    return $('[data-testid="verify-password-value"] > label > div > input');
  }

  async tapOnConfirmButton() {
    await expect(this.confirmButton).toBeDisplayed();
    await expect(this.confirmButton).toBeEnabled();
    await this.confirmButton.click();
  }
}

export default new EnterPasswordModal();
