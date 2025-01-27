import { Then, When } from "@wdio/cucumber-framework";
import IdentifierOptionsModal from "../../screen-objects/components/identifier/identifier-options.modal.js";

When(
  /^tap Delete identifier option from Identifier Options modal$/,
  async function () {
    await IdentifierOptionsModal.deleteIdentifierOption.click();
  }
);

When(
  /^user tap Edit identifier option from Identifier Options modal$/,
  async function () {
    await IdentifierOptionsModal.editIdentifierOption.click();
  }
);

Then(
  /^user tap Share Identifier icon on Share identifier modal$/,
  async function () {
    await IdentifierOptionsModal.shareIdentifierOption.click();
  }
);
