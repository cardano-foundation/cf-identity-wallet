import { findAndClickLocator } from "../base.screen.js";

export class AlertModal {
  async clickCancelButtonOf(parent: string) {
    await findAndClickLocator(`${parent} #cancel-alert-button`);
  }

  async clickConfirmButtonOf(parent: string) {
    await findAndClickLocator(`${parent} #confirm-alert-button`);
  }

  async clickCancelButtonSameLevelInDOM(parent: string) {
    await findAndClickLocator(`${parent}#cancel-alert-button`);
  }

  async clickConfirmButtonSameLevelInDOM(parent: string) {
    await findAndClickLocator(`${parent}#confirm-alert-button`);
  }
}

export default new AlertModal();
