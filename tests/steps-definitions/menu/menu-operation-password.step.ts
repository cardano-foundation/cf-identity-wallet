import { Then, When } from "@wdio/cucumber-framework";
import MenuOperationPasswordScreen from "../../screen-objects/menu/menu-operation-password.screen.js";

When(/^user tap on Back Button on Manage Password screen$/, async function () {
  await MenuOperationPasswordScreen.tapOnBackButton();
});

When(
  /^user tap on Operation Password button on Manage Password screen$/,
  async function () {
    await MenuOperationPasswordScreen.tapOnOperationPasswordButton();
  }
);

Then(/^user can see Manage Password screen$/, async function () {
  await MenuOperationPasswordScreen.loads();
});

Then(
  /^user see the status of Operations Password is (true|false)$/,
  async function (expectedStatus: string) {
    const actualStatus =
      await MenuOperationPasswordScreen.getOperationPasswordButtonStatus();
    expect(actualStatus.toString()).toMatch(expectedStatus);
  }
);
