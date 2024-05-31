import { driver } from "@wdio/globals";
import { expect } from "expect-webdriverio";
import Ajv from "ajv";
import { log } from "./logger.js";

export class Assert {
  get toastMessageOverlay() {
    return $("[data-testid=\"confirmation-toast\"]");
  }

  async clipboard() {
    const clipboardValue = atob(await driver.getClipboard());
    log.info(`CLIPBOARD VALUE: ${clipboardValue}`);
    await expect(clipboardValue).not.toBe("");
  }

  async toast(message: string) {
    await expect(await this.toastMessageOverlay).toHaveText(message);
    await this.toastMessageOverlay.waitForDisplayed({ reverse: true });
  }

  async responseJsonSchema(clipboardValue: string, jsonSchema: object) {
    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    const isValid = validate(JSON.parse(clipboardValue));
    log.info(`JSON BODY: ${JSON.stringify(clipboardValue)}`);
    if (isValid) {
      log.info("Response json schema is valid!");
    } else {
      log.info(
        `Response json schema is wrong: ${ajv.errorsText(validate.errors)}`
      );
      throw new Error(ajv.errorsText(validate.errors));
    }
  }
}

export default new Assert();
