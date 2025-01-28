import { Then, When } from "@wdio/cucumber-framework";
import { driver } from "@wdio/globals";
import IdentifierShareModal from "../../screen-objects/components/identifier/identifier-share.modal.js";

When(/^user see Share Identifier modal$/, async function () {
  await IdentifierShareModal.loads();
});

When(
  /^user tap Copy Identifier icon on Share identifier modal$/,
  async function () {
    await driver.setClipboard("");
    await IdentifierShareModal.copyButton2.click()
  }
);

Then(
  /^user tap More Share Options icon on Share identifier modal$/,
  async function () {
    await IdentifierShareModal.moreOptionsButton.click();
  }
);
