import { findAndClickElement } from "../base.screen.js";

export class AlertModal {
  async clickCancelButton() {
    await findAndClickElement("#cancel-alert-button");
  }

  async clickConfirmButton() {
    await findAndClickElement("#confirm-alert-button");
  }
}

export default new AlertModal();
