import { Then, When } from "@wdio/cucumber-framework";
import { driver } from "@wdio/globals";
import IdentityShareModal from "../../screen-objects/components/identity/identity-share.modal.js";
import { delay } from "../../screen-objects/base.screen.js";
import Gestures from "../../helpers/gestures.js";

When(/^user see Share Identifier modal$/, async function () {
  await IdentityShareModal.loads();
});

When(
  /^user tap Copy Identifier icon on Share identifier modal$/,
  async function () {
    await driver.setClipboard("");
    await IdentityShareModal.copyButton2.click()
  }
);

Then(
  /^user tap More Share Options icon on Share identifier modal$/,
  async function () {
    await IdentityShareModal.moreOptionsButton.click();
  }
);
