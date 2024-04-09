import { expect } from "expect-webdriverio";
import { generateRandomNumbersArray } from "../helpers/generate.js";
import { log } from "../helpers/logger.js";
import { Passcode } from "../constants/text.constants.js";

export class PasscodeScreen {
  get forgotYourPasscodeButton() {
    return $("[data-testid=\"secondary-button-set-passcode\"]");
  }

  get id() {
    return "[data-testid=\"set-passcode-page\"]";
  }

  get screenTitle() {
    return $("[data-testid=\"set-passcode-title\"]");
  }

  get screenDescriptionText() {
    return $("[data-testid=\"set-passcode-description\"]");
  }

  async digitButton(digit: number, parentElement = "") {
    return $(
      `${parentElement} [data-testid="passcode-button-${digit}"]`.trimStart()
    );
  }

  async loads() {
    await expect(this.screenTitle).toBeDisplayed();
    await expect(this.screenTitle).toHaveText(Passcode.Title);
    await expect(this.screenDescriptionText).toBeDisplayed();
    await expect(this.screenDescriptionText).toHaveText(Passcode.Description);
    for (let i = 0; i < 10; i++) {
      await expect(this.digitButton(i)).toBeDisplayed();
    }
  }

  async loadsReEnterScreen() {
    await expect(this.screenTitle).toBeDisplayed();
    await expect(this.screenTitle).toHaveText(Passcode.TitleReEnter);
  }

  async enterPasscode(passcode: number[], parentElement = "") {
    const digitButtonMap: {
      [key: number]: () => Promise<void>;
    } = {};
    for (let i = 0; i < 10; i++) {
      digitButtonMap[i] = async () => {
        await (await this.digitButton(i, parentElement)).click();
      };
    }
    //clicking digits on the screen
    for (const digit of passcode) {
      await digitButtonMap[digit]();
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
