import { expect } from "expect-webdriverio";
import { PasscodeScreen } from "../onboarding/passcode.screen";
import { Passcode } from "../../constants/text.constants";

export class MenuPasscodeScreen extends PasscodeScreen {
  get cancelButton() {
    return $('[data-testid="close-button-label"]');
  }

  get changePinTitle() {
    return $('[data-testid="change-pin-title"]');
  }

  get cantRememberButton() {
    return $('[data-testid="secondary-button-change-pin"]');
  }

  async tapOnCancelButton() {
    await expect(this.cancelButton).toBeDisplayed();
    await expect(this.cancelButton).toBeEnabled();
    await this.cancelButton.click();
  }

  async loads() {
    await expect(this.changePinTitle).toBeDisplayed();
    await expect(this.changePinTitle).toHaveText(Passcode.TitleNewPasscode);
    await expect(this.screenDescriptionText).toBeDisplayed();
    await expect(this.screenDescriptionText).toHaveText(
      Passcode.DescriptionNewPasscode
    );
    for (let i = 0; i < 10; i++) {
      await expect(await this.digitButton(i)).toBeDisplayed();
    }
  }
}

export default new MenuPasscodeScreen();
