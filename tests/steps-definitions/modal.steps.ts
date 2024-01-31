import { Then, When } from "@wdio/cucumber-framework";
import AlertModal from "../screen-objects/components/alert.modal.js";
import BaseModal from "../screen-objects/components/base.modal.js";
import PrivacyPolicyModal from "../screen-objects/components/privacy-policy.modal.js";
import TermsOfUseModal from "../screen-objects/components/terms-of-use.modal.js";

When(/^tap Cancel button on alert modal$/, async function () {
  await AlertModal.clickCancelButton();
});

When(/^tap Confirm button on alert modal$/, async function () {
  await AlertModal.clickConfirmButton();
});

When(/^user tap Done button on modal$/, async function () {
  await BaseModal.closeButton.click();
});

Then(/^user can see Terms of Use modal$/, async function () {
  await TermsOfUseModal.loads();
});

Then(/^user can see Privacy Policy modal$/, async function () {
  await PrivacyPolicyModal.loads();
});
