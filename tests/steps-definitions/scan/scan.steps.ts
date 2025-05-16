import { When, Then } from "@wdio/cucumber-framework";
import ScanScreen from "../../screen-objects/scan/scan.screen";

When(/^user click on scan button$/, async function () {
  await ScanScreen.scanItem.click();
});

Then(/^scan screen load correctly$/, async function () {
  await ScanScreen.loads();
});

When(/^user paste faulty content$/, async function () {
  await ScanScreen.inputToPasteContentTextbox("faulty content");
  await ScanScreen.confirmButton.click();
});

Then(/^a error message appear$/, async function () {
  await ScanScreen.checkErrorMessage();
  await ScanScreen.confirmAlertButton.click();
});
