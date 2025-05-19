import { When } from "@wdio/cucumber-framework";
import TabBar from "../screen-objects/components/tab.bar";
import MenuScreen from "../screen-objects/menu/menu.screen";
import MenuSettingsScreen from "../screen-objects/menu/menu-settings.screen";

When(
  /^user navigate to Change Passcode screen on Menu section$/,
  async function () {
    await TabBar.tapOnMenuButton();
    await MenuScreen.tapOnSettingsButton();
    await MenuSettingsScreen.tapOnChangePasscodeButton();
  }
);
