import { BaseModal } from "./base.modal.js";

export class WelcomeModal extends BaseModal {
  get confirmButton() {
    return $("[data-testid=\"primary-button-set-user-name\"]");
  }

  get nameInput() {
    return $("#set-user-name-input > label > div > input");
  }
}

export default new WelcomeModal();
