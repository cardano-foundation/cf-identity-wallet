import { When } from "@wdio/cucumber-framework";
import { editAndReturnIdentifierName } from "../../actions/identifiers.action.js";
import CommonIdentifierModal  from "../../screen-objects/components/identifier/common-identifier.modal.js";
import IdentifierEditModal from "../../screen-objects/components/identifier/identifier-edit.modal.js";

When(/^user modify display name on Edit Identifier modal$/, async function () {
  this.editedIdentityName = await editAndReturnIdentifierName();
});

When(
  /^user tap Confirm Changes button on Edit Identifier modal$/,
  async function () {
    await CommonIdentifierModal.displayNameTitle.click();
    await CommonIdentifierModal.displayNameTitle.click();
    await IdentifierEditModal.confirmChangesButton.click();
  }
);
