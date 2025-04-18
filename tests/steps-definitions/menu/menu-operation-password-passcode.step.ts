import { Then } from "@wdio/cucumber-framework";
import MenuOperationPasswordPasscodeScreen from "../../screen-objects/menu/menu-operation-password-passcode.screen.js";

Then(
  /^user can see Passcode screen from Operation Password Screen$/,
  async function () {
    await MenuOperationPasswordPasscodeScreen.loads();
  }
);
