import { findAndClickElement } from "../base.screen.js";

export class AlertModal {
  async clickCancelAlertButton() {
    await findAndClickElement("#cancel-alert-button");
  }

  async clickConfirmAlertButton() {
    await findAndClickElement("#confirm-alert-button");
  }
}

export default new AlertModal();
