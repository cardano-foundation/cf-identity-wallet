import { expect } from "expect-webdriverio";
import { WelcomeMessage } from "../../constants/text.constants";

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

  get pendingToastMessage() {
    return $("[data-testid*='confirmation-toast'][message='Identifier pending']");
  }

  get createdToastMessage() {
    return $("[data-testid*='confirmation-toast'][message='Identifier created']")
  }

  async loads(titleName: string) {
    await expect(this.titleText).toBeDisplayed();
    await expect(this.titleText).toHaveText(titleName);
    await expect(this.welcomeText).toBeDisplayed();
    await expect(this.welcomeText).toHaveText(WelcomeMessage.Description)
    await expect(this.skipButton).toBeDisplayed();
  }
  async pendingToast() {
    if (await this.pendingToastMessage.isDisplayed()) {
      await expect(this.createdToastMessage.getAttribute("message")).toHaveText("Identifier pending");
      await this.pendingToastMessage.waitForDisplayed({ reverse: true });
    }
  }
  async createdToast() {
    if (await this.createdToastMessage.isDisplayed()) {
      await expect(this.createdToastMessage.getAttribute("message")).toHaveText("Identifier created");
      await this.createdToastMessage.waitForDisplayed({ reverse: true });
    }
  }
}


export default new OnboardingAddingIdentifierWelcomeScreen();