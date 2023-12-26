import { Then } from "@wdio/cucumber-framework";
import IdentityScreen from "../screen-objects/identity.screen.js";

Then(/^user can see Identity screen$/, async function () {
  await IdentityScreen.loads();
});
