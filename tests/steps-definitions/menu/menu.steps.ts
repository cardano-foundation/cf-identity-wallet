import {  Then, When } from "@wdio/cucumber-framework";
import MenuScreen from "../../screen-objects/menu/menu.screen.js";


When(/^user tap Settings button on Menu screen$/, async function () {
  await MenuScreen.tapOnSettingsButton();
});

Then(/^user can see Menu screen$/, async function () {
  await MenuScreen.loads();
});
