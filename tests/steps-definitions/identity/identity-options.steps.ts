import { Then, When } from "@wdio/cucumber-framework";
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

Then(
  /^user tap Share Identifier icon on Share identifier modal$/,
  async function () {
    await IdentityOptionsModal.shareIdentifierOption.click();
  }
);
