export class IdentityOptionsModal {
  get copyJsonButton() {
    return $("[data-testid=\"copy-json-button\"]");
  }

  get deleteIdentifierOption() {
    return $("[data-testid=\"delete-identifier-options\"]");
  }

  get editIdentifierOption() {
    return $("[data-testid=\"edit-identifier-options\"]");
  }

  get saveToDeviceButton() {
    return $("[data-testid=\"save-to-device-button\"]");
  }

  get shareIdentifierOption() {
    return $("[data-testid=\"share-identifier-options\"]");
  }

  get viewJsonOption() {
    return $("[data-testid=\"view-json-identifier-options\"]");
  }
}

export default new IdentityOptionsModal();
