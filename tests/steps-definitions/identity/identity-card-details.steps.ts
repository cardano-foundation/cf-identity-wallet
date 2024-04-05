import { Given, Then, When } from "@wdio/cucumber-framework";
import { cardDetails } from "../../helpers/card-details.js";
import BaseModal from "../../screen-objects/components/base.modal.js";
import IdentityCardDetailsScreen from "../../screen-objects/identity/identity-card-details.screen.js";

Given(/^user tap Share button on Card Details screen$/, async function () {
  await IdentityCardDetailsScreen.shareButton.click();
});

Given(/^user tap Favourite button on Card Details screen$/, async function () {
  await IdentityCardDetailsScreen.favouriteButton.click();
});

When(/^user tap Options button on Card Details screen$/, async function () {
  await IdentityCardDetailsScreen.optionsButton.click();
});

When(
  /^tap Delete identifier button on Card Details screen$/,
  async function () {
    await IdentityCardDetailsScreen.deleteIdentifierButton.scrollIntoView();
    await IdentityCardDetailsScreen.deleteIdentifierButton.click();
  }
);

When(/^tap Done button on Card Details screen$/, async function () {
  await BaseModal.clickDoneLabel();
});

When(
  /^user can see Card Details screen for (DIDKEY|KERI)$/,
  async function (identifierType: string) {
    await IdentityCardDetailsScreen.loads(identifierType);
  }
);

Then(
  /^user copy and verify details for (DIDKEY|KERI)$/,
  async function (identifierType: string) {
    await cardDetails().choseIdentityDetailsToVerify(identifierType);
  }
);

Then(
  /^user can see Card Details screen with new display name$/,
  async function () {
    await IdentityCardDetailsScreen.assertDisplayName(this.editedIdentityName);
  }
);
