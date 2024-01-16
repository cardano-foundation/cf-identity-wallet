import { When } from "@wdio/cucumber-framework";
import AlertModal from "../screen-objects/components/alert.modal.js";

When(/^tap Cancel button on alert modal$/, async function () {
  await AlertModal.clickCancelAlertButton();
});

When(/^tap Confirm button on alert modal$/, async function () {
  await AlertModal.clickConfirmAlertButton();
});
