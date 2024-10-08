import { Given, Then, When } from "@wdio/cucumber-framework";
import { expect } from "expect-webdriverio";
import AlertModal from "../screen-objects/components/alert.modal.js";
import CreatePasswordScreen from "../screen-objects/create-password.screen.js";
import { returnPassword } from "../helpers/generate.js";
import { delay } from "../screen-objects/base.screen";
import { log } from "../helpers/logger";

let generatedPassword: string;

Given(/^skip Create Password screen$/, async function () {
  await CreatePasswordScreen.skipButton.click();
  await AlertModal.clickConfirmButtonOf(CreatePasswordScreen.alertModal);
  log.info("END of SKIP create password screen");
});

Given(/^user tap Skip button on Create Password screen$/, async function () {
  await CreatePasswordScreen.skipButton.click();
});

Given(
  /^user generated a password of (\d+) characters$/,
  async function (passwordLength: number) {
    generatedPassword = await returnPassword(passwordLength);
  }
);

Given(/^user type in password on Create Password screen$/, async function () {
  await CreatePasswordScreen.createPasswordInput.addValue(generatedPassword);
});

Given(
  /^user confirm type in password on Create Password screen$/,
  async function () {
    await CreatePasswordScreen.confirmPasswordInput.scrollIntoView();
    await CreatePasswordScreen.confirmPasswordInput.addValue(generatedPassword);
  }
);

Given(
  /^user type in hint for the password on Create Password screen$/,
  async function () {
    await CreatePasswordScreen.hintInput.scrollIntoView();
    await CreatePasswordScreen.hintInput.addValue("test hint");
  }
);

Given(
  /^user type in password (.*) on Create Password screen$/,
  async function (password: string) {
    await CreatePasswordScreen.createPasswordInput.addValue(password);
  }
);

Given(
  /^all conditions are displayed as passed on Create Password screen$/,
  async function () {
    await expect(
      await CreatePasswordScreen.validationLengthIcon
    ).toHaveElementClass("pass");
    await expect(
      await CreatePasswordScreen.validationLowercaseIcon
    ).toHaveElementClass("pass");
    await expect(
      await CreatePasswordScreen.validationNumberIcon
    ).toHaveElementClass("pass");
    await expect(
      await CreatePasswordScreen.validationSymbolIcon
    ).toHaveElementClass("pass");
    await expect(
      await CreatePasswordScreen.validationUppercaseIcon
    ).toHaveElementClass("pass");
  }
);

When(
  /^user tap Create Password button on Create Password screen$/,
  async function () {
    await CreatePasswordScreen.createPasswordButton.scrollIntoView();
    await CreatePasswordScreen.createPasswordButton.waitForClickable();
    await CreatePasswordScreen.createPasswordButton.click();
  }
);

Then(/^user can see Create Password screen$/, async function () {
  await CreatePasswordScreen.loads();
});

Then(
  /^user can see (.*) on Create Password screen$/,
  async function (errorMessage: string) {
    await expect(await CreatePasswordScreen.errorMessageText.getText()).toMatch(
      errorMessage
    );
  }
);

Then(
  /^icon for (.*) is displayed as failed on Create Password screen$/,
  async function (caseName: string) {
    const words = caseName.split(/\s+/);
    for (const word of words) {
      if (word === "uppercase") {
        await expect(
          await CreatePasswordScreen.validationUppercaseIcon
        ).toHaveElementClass("fails");
      } else if (word === "lowercase") {
        await expect(
          await CreatePasswordScreen.validationLowercaseIcon
        ).toHaveElementClass("fails");
      } else if (word === "long" || word === "short") {
        await expect(
          await CreatePasswordScreen.validationLengthIcon
        ).toHaveElementClass("fails");
      } else if (word === "number") {
        await expect(
          await CreatePasswordScreen.validationNumberIcon
        ).toHaveElementClass("fails");
      } else if (word === "symbol") {
        await expect(
          await CreatePasswordScreen.validationSymbolIcon
        ).toHaveElementClass("fails");
      }
    }
  }
);
