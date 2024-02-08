export class BaseModal {
  get closeButton() {
    return $("[data-testid=\"close-button\"]");
  }

  async introTitle(modalName: string) {
    return $(`[data-testid="${modalName}"]`);
  }

  async introText(modalName: string) {
    return this.introTitle(`${modalName}-modal-intro-text`);
  }

  returnSectionTitleLocator = (modalName: string, sectionName: string) =>
    `[data-testid="${modalName}-modal-section-${sectionName}"`;

  async subsectionElement(locator: string, type: string, index: number) {
    return $(`${locator.slice(0, -1)}-${type}-${index}` + "\"]");
  }
}

export default new BaseModal();
