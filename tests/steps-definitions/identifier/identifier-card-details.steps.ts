import { Given, Then, When } from "@wdio/cucumber-framework";
import { cardDetails } from "../../helpers/card-details.js";
import BaseModal from "../../screen-objects/components/base.modal.js";
import IdentifierCardDetailsScreen from "../../screen-objects/identifiers/identifier-card-details.screen.js";

Given(/^user tap Share button on Identifier Card Details screen$/, async function () {
  await IdentifierCardDetailsScreen.shareButton.click();
});

Given(/^user tap Favourite button on Identifier Card Details screen$/, async function () {
  await IdentifierCardDetailsScreen.favouriteButton.click();
});

When(/^user tap Options button on Identifier Card Details screen$/, async function () {
  await IdentifierCardDetailsScreen.optionsButton.click();
});

When(
  /^tap Delete identifier button on Identifier Card Details screen$/,
  async function () {
    await IdentifierCardDetailsScreen.deleteIdentifierButton.scrollIntoView();
    await IdentifierCardDetailsScreen.deleteIdentifierButton.click();
  }
);

When(/^tap Done button on Identifier Card Details screen$/, async function () {
  await BaseModal.clickCloseButtonOf("");
});

When(
  /^user can see Identifier Card Details screen$/,
  async function () {
    await IdentifierCardDetailsScreen.loads(this.identifierName);
  }
);

Then(
  /^user copy and verify details$/,
  async function () {
    await cardDetails().choseIdentifierDetailsToVerify();
  }
);

Then(
  /^user can see Card Details screen with new display name$/,
  async function () {
    await IdentifierCardDetailsScreen.assertCardDisplayName(this.editedIdentityName);
  }
);
