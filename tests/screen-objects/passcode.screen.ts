import { expect } from "expect-webdriverio";
import { generateRandomNumbersArray } from "../helpers/generate.js";
import { log } from "../helpers/logger.js";

export class PasscodeScreen {
  get backArrowIcon() {
    return $("[data-testid=\"back-button\"]");
  }
  get digit0Button() {
    return $("[data-testid=\"passcode-button-0\"]");
  }
  get digit1Button() {
    return $("[data-testid=\"passcode-button-1\"]");
  }
  get digit2Button() {
    return $("[data-testid=\"passcode-button-2\"]");
  }
  get digit3Button() {
    return $("[data-testid=\"passcode-button-3\"]");
  }
  get digit4Button() {
    return $("[data-testid=\"passcode-button-4\"]");
  }
  get digit5Button() {
    return $("[data-testid=\"passcode-button-5\"]");
  }
  get digit6Button() {
    return $("[data-testid=\"passcode-button-6\"]");
  }
  get digit7Button() {
    return $("[data-testid=\"passcode-button-7\"]");
  }
  get digit8Button() {
    return $("[data-testid=\"passcode-button-8\"]");
  }
  get digit9Button() {
    return $("[data-testid=\"passcode-button-9\"]");
  }
  get forgotYourPasscodeButton() {
    return $("[data-testid=\"secondary-button-set-passcode\"]");
  }
  get screenTitle() {
    return $("[data-testid=\"set-passcode-title\"]");
  }
  get screenDescriptionText() {
    return $("[data-testid=\"set-passcode-description\"]");
  }

  async screenLoads() {
    await expect(this.backArrowIcon).toBeDisplayed();
    await expect(this.screenTitle).toBeDisplayed();
    await expect(this.screenDescriptionText).toBeDisplayed();
    await expect(this.digit1Button).toBeDisplayed();
    await expect(this.digit2Button).toBeDisplayed();
    await expect(this.digit3Button).toBeDisplayed();
    await expect(this.digit4Button).toBeDisplayed();
    await expect(this.digit5Button).toBeDisplayed();
    await expect(this.digit6Button).toBeDisplayed();
    await expect(this.digit7Button).toBeDisplayed();
    await expect(this.digit8Button).toBeDisplayed();
    await expect(this.digit9Button).toBeDisplayed();
    await expect(this.digit0Button).toBeDisplayed();
  }

  async enterPasscode(passcode: number[]) {
    interface DigitButtonMap {
      [key: number]: () => Promise<void>;
    }
    const digitButtonMap: DigitButtonMap = {
      0: this.digit0Button.click,
      1: this.digit1Button.click,
      2: this.digit2Button.click,
      3: this.digit3Button.click,
      4: this.digit4Button.click,
      5: this.digit5Button.click,
      6: this.digit6Button.click,
      7: this.digit7Button.click,
      8: this.digit8Button.click,
      9: this.digit9Button.click,
    };

    for (const digit of passcode) {
      await digitButtonMap[digit].call(this);
    }
  }

  async createAndEnterRandomPasscode() {
    const randomPasscode = generateRandomNumbersArray();
    log.info(`randomPasscode: ${randomPasscode}`);
    await this.enterPasscode(randomPasscode);
    return randomPasscode;
  }
}

export default new PasscodeScreen();
