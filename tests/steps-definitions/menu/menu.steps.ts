import {  Then } from "@wdio/cucumber-framework";
import MenuScreen from "../../screen-objects/menu/menu.screen.js";


Then(/^user can see Menu screen$/, async function () {
  await MenuScreen.loads();
});