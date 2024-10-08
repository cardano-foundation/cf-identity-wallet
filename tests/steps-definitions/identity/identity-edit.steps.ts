import { When } from "@wdio/cucumber-framework";
import { editAndReturnIdentifierName } from "../../actions/identity.action.js";
import CommonIdentityModal  from "../../screen-objects/components/identity/common-identity.modal.js";
import IdentityEditModal from "../../screen-objects/components/identity/identity-edit.modal.js";

When(/^user modify display name on Edit Identifier modal$/, async function () {
  this.editedIdentityName = await editAndReturnIdentifierName();
});

When(
  /^user tap Confirm Changes button on Edit Identifier modal$/,
  async function () {
    await CommonIdentityModal.displayNameTitle.click();
    await CommonIdentityModal.displayNameTitle.click();
    await IdentityEditModal.confirmChangesButton.click();
  }
);
