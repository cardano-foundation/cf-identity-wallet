import { CommonIdentityModal } from "./common-identity.modal.js";

export class IdentifierJsonModal extends CommonIdentityModal {
  get copyJsonButton() {
    return $("[data-testid=\"identifier-copy-json\"]");
  }

  get saveToDeviceButton() {
    return $("[data-testid=\"save-to-device-button\"]");
  }
}

export default new IdentifierJsonModal();
