export class BaseModal {
  get doneButton() {
    return $("[data-testid=\"close-button-label\"]");
  }

  async introTitle(modalName: string) {
    return $(`[data-testid="${modalName}-title"]`);
  }

  async introText(modalName: string) {
    return $(`[data-testid="${modalName}-modal-intro-text"]`);
  }

  returnSectionTitleLocator = (modalName: string, sectionName: string) =>
    `[data-testid="${modalName}-modal-section-${sectionName}"`;

  async subsectionElement(locator: string, type: string, index: number) {
    return $(`${locator.slice(0, -1)}-${type}-${index}` + "\"]");
  }
}

export default new BaseModal();
