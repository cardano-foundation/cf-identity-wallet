import { Then, When } from "@wdio/cucumber-framework";
import { faker } from "@faker-js/faker";
import AlertModal from "../screen-objects/components/alert.modal.js";
import Assert  from "../helpers/assert.js";
import BaseModal from "../screen-objects/components/base.modal.js";
import CreatePasswordScreen from "../screen-objects/onboarding/create-password.screen.js";
import IdentifierCardDetailsScreen from "../screen-objects/identifiers/identifier-card-details.screen.js";
import IdentifierEditModal from "../screen-objects/components/identifier/identifier-edit.modal.js";
import PrivacyPolicyModal from "../screen-objects/components/privacy-policy.modal.js";
import TermsOfUseModal from "../screen-objects/components/terms-of-use.modal.js";
import WelcomeModal  from "../screen-objects/components/welcome.modal.js";
import YourRecoveryPhraseScreen from "../screen-objects/onboarding/your-recovery-phrase.screen.js";


When(
  /^tap Cancel button on alert modal for Create Password screen$/,
  async function () {
    await AlertModal.clickCancelButtonOf(CreatePasswordScreen.alertModal);
  }
);

When(
  /^tap Cancel button on alert modal for Your Recovery Phrase screen$/,
  async function () {
    await AlertModal.clickCancelButtonOf(YourRecoveryPhraseScreen.alertModal);
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
    await AlertModal.clickConfirmButtonOf(IdentifierCardDetailsScreen.alertModal);
  }
);

When(
  /^tap Confirm button on alert modal for Your Recovery Phrase screen$/,
  async function () {
    await AlertModal.clickConfirmButtonOf(YourRecoveryPhraseScreen.alertModal);
  }
);

When(/^user tap Done button on modal$/, async function () {
  await BaseModal.clickDoneLabel();
});

When(/^user tap Cancel button on Identifier Edit modal$/, async function () {
  await BaseModal.clickCloseButtonOf(await IdentifierEditModal.idLocator);
});

When(/^user tap Cancel button on modal$/, async function () {
  await BaseModal.clickDoneLabel();
});

When(/^user add name on Welcome modal$/, async function() {
  this.userName = faker.person.firstName();
  await WelcomeModal.nameInput.setValue(this.userName);
  await WelcomeModal.confirmButton.click();
  await Assert.toast(`Welcome, ${this.userName}!`)
});

Then(/^user can see Terms of Use modal$/, async function () {
  await TermsOfUseModal.loads();
});

Then(/^user can see Privacy Policy modal$/, async function () {
  await PrivacyPolicyModal.loads();
});
