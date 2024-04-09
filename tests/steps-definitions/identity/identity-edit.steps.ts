import { When } from "@wdio/cucumber-framework";
import { editAndReturnIdentifierName } from "../../actions/identity.action.js";
import IdentityEditModal from "../../screen-objects/components/identity/identity-edit.modal.js";

When(/^user modify display name on Edit Identifier modal$/, async function () {
  this.editedIdentityName = await editAndReturnIdentifierName();
});

When(
  /^user tap Confirm Changes button on Edit Identifier modal$/,
  async function () {
    await IdentityEditModal.confirmChangesButton.click();
  }
);
