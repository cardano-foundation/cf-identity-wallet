import { Then, When } from "@wdio/cucumber-framework";
import MenuPasscodeScreen from "../../screen-objects/menu/menu-passcode.screen.js";

Then(
  /^user can see Create new passcode screen from Menu screen$/,
  async function () {
    await MenuPasscodeScreen.loads();
  }
);

When(
  /^user tap Can't remember button on Re-enter your Passcode screen from Menu screen$/,
  async function () {
    await MenuPasscodeScreen.cantRememberButton.click();
  }
);

When(
  /^user tap forgotten passcode button on Passcode screen from Menu screen$/,
  async function () {
    await MenuPasscodeScreen.tapOnForgottenPasswordButton();
  }
);

Then(
  /^user can see Enter passcode screen from Menu screen$/,
  async function () {
    await MenuPasscodeScreen.loadsOnEnterPasscodeScreen();
  }
);
