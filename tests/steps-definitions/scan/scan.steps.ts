import { Given, When, Then } from "@wdio/cucumber-framework";
import ScanScreen from "../../screen-objects/scan/scan.screen";
import { addChosenIdentifierType, inputAndReturnIdentifierName } from "../../actions/identifiers.action";
import IdentifiersScreen from "../../screen-objects/identifiers/identifiers.screen";

When(/^user click on scan button$/, async function() {
  await ScanScreen.scanItem.click();
});

Then(/^scan screen load correctly$/, async function() {
  await ScanScreen.loads();
});

When(/^user paste faulty content$/, async function() {
  await ScanScreen.inputToPasteContentTextbox("faulty content");
  if (await ScanScreen.confirmButton.isEnabled()) {
    await ScanScreen.confirmButton.click();
  }
});

Then(/^a error message appear$/, async function() {
  await ScanScreen.checkErrorMessage();
  await ScanScreen.confirmAlertButton.click();
});