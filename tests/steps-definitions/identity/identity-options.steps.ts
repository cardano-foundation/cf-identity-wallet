import { Then, When } from "@wdio/cucumber-framework";
import IdentityJsonModal from "../../screen-objects/components/identity/identifier-json.modal.js";
import IdentityOptionsModal from "../../screen-objects/components/identity/identity-options.modal.js";

When(
  /^tap Delete identifier option from Identity Options modal$/,
  async function () {
    await IdentityOptionsModal.deleteIdentifierOption.click();
  }
);

When(
  /^user tap Edit identifier option from Identity Options modal$/,
  async function () {
    await IdentityOptionsModal.editIdentifierOption.click();
  }
);

When(/^tap View JSON option from Identity Options modal$/, async function () {
  await IdentityOptionsModal.viewJsonOption.click();
});

When(/^tap Copy JSON button on Identifier JSON modal$/, async function () {
  await IdentityJsonModal.copyJsonButton.click();
});

Then(
  /^user tap Share Identifier icon on Share identifier modal$/,
  async function () {
    await IdentityOptionsModal.shareIdentifierOption.click();
  }
);
