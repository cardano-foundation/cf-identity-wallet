import { Then } from "@wdio/cucumber-framework";
import { expect } from "expect-webdriverio";
import AddAnIdentifierModal from "../../screen-objects/components/identifier/identifier-add.modal.js";

Then(/^user can see Add An Identifier modal$/, async function () {
  await AddAnIdentifierModal.loads();
});

Then(/^user can not to see Add An Identifier modal$/, async function () {
  await expect(await AddAnIdentifierModal.id).not.toBeDisplayed();
});
