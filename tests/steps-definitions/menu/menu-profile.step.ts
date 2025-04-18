import { Then, When } from "@wdio/cucumber-framework";
import MenuProfileScreen from "../../screen-objects/menu/menu-profile.screen.js";
import { expect } from "expect-webdriverio";

Then(/^user can see Profile screen$/, async function () {
  await MenuProfileScreen.loads();
});

When(/^user tap on Edit button on Profile screen$/, async function () {
  await MenuProfileScreen.tapOnEditButton();
});

When(/^user get username$/, async function () {
  await MenuProfileScreen.tapOnEditButton();
});

Then(
  /^user should see the updated username "(.*)" on the Profile screen$/,
  async function (expectedUserName: string) {
    await expect(await MenuProfileScreen.userNameText.getText()).toMatch(
      expectedUserName
    );
  }
);
