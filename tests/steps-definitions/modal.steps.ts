import { Given, Then, When } from "@wdio/cucumber-framework";
import { faker } from "@faker-js/faker";
import AlertModal from "../screen-objects/components/alert.modal.js";
import Assert from "../helpers/assert.js";
import BaseModal from "../screen-objects/components/base.modal.js";
import CreatePasswordScreen from "../screen-objects/onboarding/create-password.screen.js";
import IdentifierCardDetailsScreen from "../screen-objects/identifiers/identifier-card-details.screen.js";
import IdentifierEditModal from "../screen-objects/components/identifier/identifier-edit.modal.js";
import PrivacyPolicyModal from "../screen-objects/components/privacy-policy.modal.js";
import TermsOfUseModal from "../screen-objects/components/terms-of-use.modal.js";
import WelcomeModal from "../screen-objects/components/welcome.modal.js";
import YourRecoveryPhraseScreen from "../screen-objects/onboarding/your-recovery-phrase.screen.js";
import MenuOperationPasswordScreen from "../screen-objects/menu/menu-operation-password.screen.js";
import EnterPasswordModal from "../screen-objects/components/enter-password.modal.js";
import MenuPasscodeScreen from "../screen-objects/menu/menu-passcode.screen.js";
import StaySafeModal from "../screen-objects/components/stay-safe.modal";

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
  /^user tap Cancel button on alert modal for Manage Password screen$/,
  async function () {
    await AlertModal.clickCancelButtonSameLevelInDOM(
      MenuOperationPasswordScreen.alertModalCancelButton
    );
  }
);

When(
  /^user tap Cancel button on alert modal for Passcode screen from Menu screen$/,
  async function () {
    await AlertModal.clickCancelButtonSameLevelInDOM(
      MenuPasscodeScreen.cancelButtonOnModal
    );
  }
);

When(
  /^user tap Cancel button on Stay Safe Modal from Recovery Phrase screen$/,
  async function () {
    await StaySafeModal.cancelButton.click();
  }
);

When(
  /^user confirm and acknowledge warning then click View Recovery Phrase button on Stay Safe Modal from Recovery Phrase screen$/,
  async function () {
    await StaySafeModal.confirmConditionAndClickViewRecoveryPhraseButton();
  }
);

When(
  /^user tap Verify your Recovery Phrase button on alert modal for Passcode screen from Menu screen$/,
  async function () {
    await AlertModal.clickConfirmButtonSameLevelInDOM(
      MenuPasscodeScreen.verifyYourRecoveryButton
    );
  }
);

When(
  /^user tap Continue button on alert modal for Manage Password screen$/,
  async function () {
    await AlertModal.clickConfirmButtonSameLevelInDOM(
      MenuOperationPasswordScreen.alertModalConfirmButton
    );
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
    await AlertModal.clickConfirmButtonOf(
      IdentifierCardDetailsScreen.alertModal
    );
  }
);

When(
  /^tap Confirm button on alert modal for Your Recovery Phrase screen$/,
  async function () {
    await AlertModal.clickConfirmButtonOf(YourRecoveryPhraseScreen.alertModal);
  }
);

When(
  /^user tap Confirm button on Enter Password modal for Manage Password screen$/,
  async function () {
    await EnterPasswordModal.tapOnConfirmButton();
  }
);

Given(
  /^user type in password on Enter Password modal for Manage Password screen$/,
  async function () {
    await EnterPasswordModal.passwordInput.addValue(
      (global as any).generatedPassword
    );
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

When(/^user add name on Welcome modal$/, async function () {
  this.userName = faker.person.firstName();
  await WelcomeModal.nameInput.setValue(this.userName);
  await WelcomeModal.confirmButton.click();
  await Assert.toast(`Welcome, ${this.userName}!`);
});

Then(/^user can see Terms of Use modal$/, async function () {
  await TermsOfUseModal.loads();
});

Then(/^user can see Privacy Policy modal$/, async function () {
  await PrivacyPolicyModal.loads();
});
