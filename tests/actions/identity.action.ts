import { Given, When } from "@wdio/cucumber-framework";
import AddAnIdentifierModal from "../screen-objects/components/identity/identity-add.modal.js";
import IdentityCardDetailsScreen from "../screen-objects/identity/identity-card-details.screen.js";
import IdentityScreen from "../screen-objects/identity/identity.screen.js";
import MenuToolbar from "../screen-objects/components/menu.toolbar.js";
import { randomNameWithPrefix } from "../helpers/generate.js";

export async function inputAndReturnIdentifierName() {
  const identityName = await randomNameWithPrefix("identity");
  await AddAnIdentifierModal.displayNameInput.setValue(identityName);
  await AddAnIdentifierModal.titleText.click();
  return identityName;
}

async function addChosenIdentityType(identifierType: string) {
  const identityName = inputAndReturnIdentifierName();
  if (identifierType==="KERI") {
    await AddAnIdentifierModal.clickChosenIdentifierType(identifierType);
  }
  await AddAnIdentifierModal.createIdentifierButton.waitForClickable();
  await AddAnIdentifierModal.createIdentifierButton.click();
  return identityName;
}

async function addChosenIdentityTypeByPlusIcon(identifierType: string) {
  await MenuToolbar.addButton.click();
  return await addChosenIdentityType(identifierType);
}

Given(
  /^identifier is created and user can see Card Details screen for (DIDKEY|KERI)$/,
  async function(identifierType: string) {
    this.identifierType = identifierType;
    this.identityName = await addChosenIdentityTypeByPlusIcon(identifierType);
    await (await IdentityScreen.identityAllCard(0)).click();
    await IdentityCardDetailsScreen.loads(identifierType);
  },
);

Given(
  /^user add (DIDKEY|KERI) identity through plus icon$/,
  async function(identifierType: string) {
    this.identifierType = identifierType;
    this.identityName = await addChosenIdentityTypeByPlusIcon(identifierType);
  },
);

When(
  /^user add (DIDKEY|KERI) identity$/,
  async function(identifierType: string) {
    this.identifierType = identifierType;
    this.identityName = await addChosenIdentityType(identifierType);
  },
);
