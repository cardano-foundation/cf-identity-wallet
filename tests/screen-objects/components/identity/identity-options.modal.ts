import { CommonIdentityModal } from "./common-identity.modal.js";

export class IdentityOptionsModal extends CommonIdentityModal {
  get deleteIdentifierOption() {
    return $("[data-testid=\"delete-identifier-options\"]");
  }

  get editIdentifierOption() {
    return $("[data-testid=\"edit-identifier-options\"]");
  }

  get id() {
    return this.idElement("view");
  }

  get shareIdentifierOption() {
    return $("[data-testid=\"share-identifier-options\"]");
  }

  get viewJsonOption() {
    return $("[data-testid=\"view-json-identifier-options\"]");
  }
}

export default new IdentityOptionsModal();
