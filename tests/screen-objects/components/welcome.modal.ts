import { BaseModal } from "./base.modal.js";

export class WelcomeModal extends BaseModal {
  get confirmButton() {
    return $("[data-testid=\"primary-button-input-request\"]");
  }

  get nameInput() {
    return $("[data-testid=\"input-request-input\"] > label > div > input");
  }
}

export default new WelcomeModal();
