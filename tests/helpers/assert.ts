import { driver } from "@wdio/globals";
import { expect } from "expect-webdriverio";
import { log } from "./logger.js";

export class Assert {
  get toastMessageOverlay() {
    return $("[data-testid*=\"confirmation-toast\"]");
  }

  async clipboard() {
    const clipboardValue = atob(await driver.getClipboard());
    log.info(`CLIPBOARD VALUE: ${clipboardValue}`);
    await expect(clipboardValue).not.toBe("");
  }

  async toast(message: string) {
    await expect(this.toastMessageOverlay).toHaveText(message);
    await this.toastMessageOverlay.waitForDisplayed({ reverse: true });
  }
}

export default new Assert();
