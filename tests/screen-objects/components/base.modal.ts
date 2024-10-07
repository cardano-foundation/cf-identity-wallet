import {
  findAndClickLocator,
  findFilterAndClickElement,
} from "../base.screen.js";

export class BaseModal {
  closeButtonLocator = "[data-testid=\"close-button\"]";

  async clickCloseButtonOf(parent: string) {
    await findAndClickLocator(`${parent} ${this.closeButtonLocator}`);
  }

  async clickDoneLabel() {
    await findFilterAndClickElement("[data-testid=\"close-button-label\"]");
  }

  async tapDoneButton() {
    await findFilterAndClickElement("[data-testid=\"tab-done-button\"] h4");
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
