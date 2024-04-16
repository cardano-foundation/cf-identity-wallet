export class CommonIdentityModal {
  get displayNameTitle() {
    return $("[data-testid=\"display-name-title\"]");
  }

  get themeTitle() {
    return $(".theme-input-title");
  }

  async themeItem(index: number) {
    return $(`[data-testid="identifier-theme-selector-item-${index}"]`);
  }

  async clickChosenTheme(index: number) {
    await (await this.themeItem(index)).click();
  }

  async displayNameInputElement(elementName: string) {
    return $(`#${elementName}-name-input > label > div > input`);
  }

  async getIdElementLocator(elementName: string) {
    return `[data-testid="${elementName}-identifier-modal"]`;
  }

  async idElement(elementName: string) {
    return $(await this.getIdElementLocator(elementName));
  }

  async identifierTypeItem(name: string) {
    return $(`[data-testid="identifier-type-${name.toLowerCase()}"]`);
  }

  async modalTitleElement(elementName: string) {
    return $(`[data-testid="${elementName}-title"]`);
  }

  async clickChosenIdentifierType(identifierType: string) {
    await (await this.identifierTypeItem(identifierType)).click();
  }
}

export default new CommonIdentityModal();
