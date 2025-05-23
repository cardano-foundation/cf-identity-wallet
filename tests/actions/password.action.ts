import { Given, When } from "@wdio/cucumber-framework";
import { returnPassword } from "../helpers/generate";
import CreatePasswordScreen from "../screen-objects/onboarding/create-password.screen.js";

Given(
  /^user generated a password of (\d+) characters on Create Password screen$/,
  async function (passwordLength: number) {
    (global as any).generatedPassword = await returnPassword(passwordLength);
    await CreatePasswordScreen.createPasswordInput.addValue(
      (global as any).generatedPassword
    );
    await CreatePasswordScreen.confirmPasswordInput.scrollIntoView();
    await CreatePasswordScreen.confirmPasswordInput.addValue(
      (global as any).generatedPassword
    );
    await CreatePasswordScreen.createPasswordButton.scrollIntoView();
    await CreatePasswordScreen.createPasswordButton.waitForClickable();
    await CreatePasswordScreen.createPasswordButton.click();
  }
);
