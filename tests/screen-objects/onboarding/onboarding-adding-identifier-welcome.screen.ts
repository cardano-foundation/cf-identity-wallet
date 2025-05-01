import { expect } from "expect-webdriverio";
import { WelcomeMessage } from "../../constants/text.constants";
import { $ } from "@wdio/globals";

export class OnboardingAddingIdentifierWelcomeScreen {

  get titleText() {
    return $(".content > h2")
  }

  get welcomeText() {
    return $(".content > p")
  }

  get addIdentifierButton() {
    return $("[data-testid='primary-button-welcome']")
  }

  get skipButton() {
    return $("[data-testid='action-button']")
  }

  async loadWelcomeText() {
    await expect(this.welcomeText).toBeDisplayed();
    await expect(this.welcomeText).toHaveText(WelcomeMessage.Description)
  }

  async loadTitleText(message: string) {
    await expect(this.titleText).toBeDisplayed();
    await expect(this.titleText).toHaveText(message);
  }
}


export default new OnboardingAddingIdentifierWelcomeScreen();