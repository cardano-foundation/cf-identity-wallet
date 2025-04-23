import { When } from "@wdio/cucumber-framework";
import MenuEditProfileScreen from "../../screen-objects/menu/menu-edit-profile.screen.js";

When(/^user tap on Cancel button on Edit Profile screen$/, async function () {
  await MenuEditProfileScreen.tapOnCancelButton();
});

When(
  /^user edit username to "(.*)" on Edit Profile screen$/,
  async function (newUsername: string) {
    await MenuEditProfileScreen.clickClearEnterNewUserNameTextBox(newUsername);
  }
);

When(/^user tap on confirm button on Edit Profile screen$/, async function () {
  await MenuEditProfileScreen.tapOnConfirmButton();
});
