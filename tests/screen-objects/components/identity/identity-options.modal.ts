import { CommonIdentityModal } from "./common-identity.modal.js";

export class IdentityOptionsModal extends CommonIdentityModal {
  get deleteIdentifierOption() {
    return $("[data-testid=\"delete-identifier-option\"]");
  }

  get editIdentifierOption() {
    return $("[data-testid=\"edit-identifier-option\"]");
  }

  get id() {
    return this.idElement("view");
  }

  get shareIdentifierOption() {
    return $("[data-testid=\"share-identifier-option\"]");
  }
}

export default new IdentityOptionsModal();
