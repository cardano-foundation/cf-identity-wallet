import { Given } from "@wdio/cucumber-framework";
import MenuToolbar from "../screen-objects/components/menu.toolbar.js";

Given(/^user tap Back arrow icon on the screen$/, async function () {
  await MenuToolbar.clickBackArrowIcon();
});
