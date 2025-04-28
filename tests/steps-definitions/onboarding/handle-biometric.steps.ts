import { Given, Then, When } from "@wdio/cucumber-framework";
import BiometricScreen from "../../screen-objects/onboarding/biometric.screen";

Given(/^user can see Biometric popup$/, async function() {
  await BiometricScreen.loads();
});

When(/^user tap Don't allow button$/, async function() {
  await BiometricScreen.cancelButton.click();
});

Then(/^Canceled Biometric popup is displayed$/, async function() {
  await BiometricScreen.cancelBiometricLoads();
});

When(/^user tap OK button$/, async function() {
  await BiometricScreen.okButton.click();
});

Then(/^Biometric popup is closed$/, async function() {
  await BiometricScreen.closeCancelBiometricPopup();
});