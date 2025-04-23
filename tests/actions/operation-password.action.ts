import { Given, When } from "@wdio/cucumber-framework";
import AlertModal from "../screen-objects/components/alert.modal.js";
import MenuOperationPasswordScreen from "../screen-objects/menu/menu-operation-password.screen.js";
import EnterPasswordModal from "../screen-objects/components/enter-password.modal";
import Gestures from "../helpers/gestures";
import { findAndClickLocator } from "../screen-objects/base.screen";

When(
  /^user successfully confirmed password flow on Manage Password screen$/,
  async function () {
    await MenuOperationPasswordScreen.tapOnOperationPasswordButton();
    await AlertModal.clickConfirmButtonSameLevelInDOM(
      MenuOperationPasswordScreen.alertModalConfirmButton
    );
  }
);

When(
  /^user successfully confirmed password flow on Enter Password modal from Manage Password screen$/,
  async function () {
    await MenuOperationPasswordScreen.tapOnOperationPasswordButton();
    await MenuOperationPasswordScreen.tapOnAlertModalConfirmButton();
    await EnterPasswordModal.passwordInput.addValue(
      (global as any).generatedPassword
    );
    await EnterPasswordModal.tapOnConfirmButton();
  }
);
