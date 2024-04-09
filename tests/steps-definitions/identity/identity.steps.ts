import { Given, Then, When } from "@wdio/cucumber-framework";
import { expect } from "expect-webdriverio";
import { format } from "date-fns";
import Assert from "../../helpers/assert.js";
import IdentityCardDetailsScreen from "../../screen-objects/identity/identity-card-details.screen.js";
import IdentityScreen from "../../screen-objects/identity/identity.screen.js";
import { Message } from "../../constants/toast.constants.js";

Given(
  /^user tap Add an identified button on the Identity screen$/,
  async function () {
    await IdentityScreen.addAnIdentifierButton.click();
  }
);

When(
  /^user chose newly created identity on Identity screen$/,
  async function () {
    await (await IdentityScreen.identityAllCard(0)).click();
  }
);

Then(/^user can see Identity screen$/, async function () {
  await IdentityScreen.loads();
});

Then(
  /^user can see Identity screen with (\d+) (card|cards)$/,
  async function (cardCount: number, dummy: string) {
    await IdentityScreen.loads(false, cardCount);
  }
);

Then(/^user can see identity card details$/, async function () {
  if (this.identityType == "DIDKEY") {
    await expect(await IdentityCardDetailsScreen.cardKeyTypeText(0)).toHaveText(
      "did:key"
    );
  }
  await expect(
    await IdentityCardDetailsScreen.cardDisplayNameText(0)
  ).toHaveText(this.identityName);
  await expect(
    await IdentityCardDetailsScreen.cardCreationDateText(0)
  ).toHaveText(format(new Date(), "dd/MM/yyyy"));
});

Then(
  /^user can see toast message about created identity on Identity screen$/,
  async function () {
    await Assert.toast(Message.NewIdentifierCreatedSuccessfully);
  }
);

Then(
  /^user can see toast message about deleted identity on Identity screen$/,
  async function () {
    await Assert.toast(Message.IdentifierSuccessfullyDeleted);
  }
);

Then(
  /^user can see Add An Identifier button on Identity screen$/,
  async function () {
    await expect(await IdentityScreen.addAnIdentifierButton).toBeDisplayed();
  }
);

Then(
  /^user can see chosen identity as his favourite on Identity screen$/,
  async function () {
    await expect(await IdentityScreen.identityFavouriteCard(0)).toBeDisplayed();
  }
);
