import { Then, When } from "@wdio/cucumber-framework";
import AlertModal from "../screen-objects/components/alert.modal.js";
import BaseModal from "../screen-objects/components/base.modal.js";
import CreatePasswordScreen from "../screen-objects/create-password.screen.js";
import IdentityCardDetailsScreen from "../screen-objects/identity/identity-card-details.screen.js";
import IdentityEditModal from "../screen-objects/components/identity/identity-edit.modal.js";
import IdentityOptionsModal from "../screen-objects/components/identity/identity-options.modal.js";
import PrivacyPolicyModal from "../screen-objects/components/privacy-policy.modal.js";
import SeedPhraseGenerateScreen from "../screen-objects/seed-phrase/seed-phrase-generate.screen.js";
import TermsOfUseModal from "../screen-objects/components/terms-of-use.modal.js";

When(
  /^tap Cancel button on alert modal for Create Password screen$/,
  async function () {
    await AlertModal.clickCancelButtonOf(CreatePasswordScreen.alertModal);
  }
);

When(
  /^tap Cancel button on alert modal for Seed Phrase Generate screen$/,
  async function () {
    await AlertModal.clickCancelButtonOf(SeedPhraseGenerateScreen.alertModal);
  }
);

When(
  /^tap Confirm button on alert modal for Create Password screen$/,
  async function () {
    await AlertModal.clickConfirmButtonOf(CreatePasswordScreen.alertModal);
  }
);

When(
  /^tap Confirm button on alert modal on Identifier Card Details screen$/,
  async function () {
    await AlertModal.clickConfirmButtonOf(IdentityCardDetailsScreen.alertModal);
  }
);

When(
  /^tap Confirm button on alert modal for Identifier Options modal$/,
  async function () {
    await AlertModal.clickConfirmButtonOf(IdentityOptionsModal.alertModal);
  }
);

When(
  /^tap Confirm button on alert modal for Seed Phrase Generate screen$/,
  async function () {
    await AlertModal.clickConfirmButtonOf(SeedPhraseGenerateScreen.alertModal);
  }
);

When(/^user tap Done button on modal$/, async function () {
  await BaseModal.clickDoneLabel();
});

When(/^user tap Cancel button on Identifier Edit modal$/, async function () {
  await BaseModal.clickCloseButtonOf(await IdentityEditModal.idLocator);
});

When(/^user tap Done button on Identifier JSON modal$/, async function () {
  await BaseModal.clickDoneButton();
});

When(/^user tap Cancel button on modal$/, async function () {
  await BaseModal.clickDoneLabel();
});

Then(/^user can see Terms of Use modal$/, async function () {
  await TermsOfUseModal.loads();
});

Then(/^user can see Privacy Policy modal$/, async function () {
  await PrivacyPolicyModal.loads();
});
