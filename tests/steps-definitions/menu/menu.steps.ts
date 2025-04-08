import {  Then, When } from "@wdio/cucumber-framework";
import MenuScreen from "../../screen-objects/menu/menu.screen.js";

When(/^user tap Settings button on Menu screen$/, async function () {
  await MenuScreen.tapOnSettingsButton();
});

When(/^user tap on Profile button on Menu screen$/, async function () {
  await MenuScreen.tapOnProfileButton();
});

Then(/^user can see Menu screen$/, async function () {
  await MenuScreen.loads();
});
