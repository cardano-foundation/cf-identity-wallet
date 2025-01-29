import { Then } from "@wdio/cucumber-framework";
import MenuSettingsScreen from "../../screen-objects/menu/menu-settings.screen.js";

Then(/^user can see Menu Settings screen$/, async function () {
  await MenuSettingsScreen.loads();
});