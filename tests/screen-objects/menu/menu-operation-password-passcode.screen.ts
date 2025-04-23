import { expect } from "expect-webdriverio";
import { PasscodeScreen } from "../onboarding/passcode.screen";
import { Passcode } from "../../constants/text.constants";

export class MenuOperationPasswordPasscodeScreen extends PasscodeScreen {
  get verifyPasscodeTitle() {
    return $('[data-testid="verify-passcode-title"]');
  }

  get screenDescriptionText() {
    return $('[data-testid="verify-passcode-description"]');
  }

  async loads() {
    await expect(this.verifyPasscodeTitle).toBeDisplayed();
    await expect(this.verifyPasscodeTitle).toHaveText(
      Passcode.TitleEnterPasscode
    );
    await expect(this.screenDescriptionText).toBeDisplayed();
    await expect(this.screenDescriptionText).toHaveText(
      Passcode.DescriptionEnterPasscode
    );
    for (let i = 0; i < 10; i++) {
      await expect(await this.digitButton(i)).toBeDisplayed();
    }
  }
}

export default new MenuOperationPasswordPasscodeScreen();
