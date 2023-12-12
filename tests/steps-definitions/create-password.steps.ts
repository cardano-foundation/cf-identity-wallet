import { Given, Then } from "@wdio/cucumber-framework";
import AlertModal from "../screen-objects/components/alert.modal.js";
import CreatePasswordScreen from "../screen-objects/create-password.screen.js";

Given(/^skip Create Password screen$/, async function () {
  await CreatePasswordScreen.skipButton.click();
  await AlertModal.clickConfirmAlertButton();
});

Then(/^user can see Create Password screen$/, async function () {
  await CreatePasswordScreen.loads();
});
