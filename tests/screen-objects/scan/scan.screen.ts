import { expect } from "expect-webdriverio";
import { ScanContent } from "../../constants/text.constants";

export class ScanScreen {
  get scanItem() {
    return $("[data-testid='tab-button-scan']");
  }

  get scannerText() {
    return $("span.qr-code-scanner-text");
  }

  get pasteButton() {
    return $("[data-testid='secondary-button-scanner']");
  }

  get pasteTextbox() {
    return $("[id*='ion-input']");
  }

  get confirmButton() {
    return $("[data-testid='action-button']");
  }

  get errorMessage() {
    return $("[data-testid='app-error-alert'] .alert-title.sc-ion-alert-ios");
  }

  get confirmAlertButton() {
    return $("[data-testid='app-error-alert-confirm-button']");
  }

  async loads() {
    await expect(this.scannerText).toBeDisplayed();
    await expect(this.scannerText).toHaveText(ScanContent.ScannerText);
    await expect(this.pasteButton).toBeDisplayed();
  }

  async checkErrorMessage() {
    await expect(this.errorMessage).toBeDisplayed();
    await expect(this.errorMessage).toHaveText(ScanContent.ErrorMessage);
  }

  async inputToPasteContentTextbox(content: string) {
    await this.pasteButton.click();
    await this.pasteTextbox.setValue(content);
  }
}

export default new ScanScreen();
