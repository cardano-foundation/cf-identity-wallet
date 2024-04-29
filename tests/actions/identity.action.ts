import { Given, When } from "@wdio/cucumber-framework";
import AddAnIdentifierModal from "../screen-objects/components/identity/identity-add.modal.js";
import Gestures from "../helpers/gestures.js";
import IdentityCardDetailsScreen from "../screen-objects/identity/identity-card-details.screen.js";
import IdentityEditModal from "../screen-objects/components/identity/identity-edit.modal.js";
import IdentityScreen from "../screen-objects/identity/identity.screen.js";
import MenuToolbar from "../screen-objects/components/menu.toolbar.js";
import { randomNameWithPrefix } from "../helpers/generate.js";

export async function editAndReturnIdentifierName() {
  const identityName = await randomNameWithPrefix("edit-identity");
  await (await IdentityEditModal.displayNameInput).setValue(identityName);
  await Gestures.tapAtPercentageOfScreenHeight(40);
  return identityName;
}

export async function inputAndReturnIdentifierName() {
  const identityName = await randomNameWithPrefix("identity");
  await (await AddAnIdentifierModal.displayNameInput).setValue(identityName);
  await Gestures.tapAtPercentageOfScreenHeight(10);
  await Gestures.tapAtPercentageOfScreenHeight(10);
  return identityName;
}

async function addChosenIdentityType() {
  const identityName = inputAndReturnIdentifierName();
  await AddAnIdentifierModal.createIdentifierButton.waitForClickable();
  await AddAnIdentifierModal.createIdentifierButton.click();
  return identityName;
}

async function addChosenIdentityTypeByPlusIcon() {
  await MenuToolbar.addButton.click();
  return await addChosenIdentityType();
}

Given(
  /^identifier is created and user can see Card Details screen for (KERI)$/,
  async function (identifierType: string) {
    this.identifierType = identifierType;
    this.identityName = await addChosenIdentityTypeByPlusIcon();
    await (await IdentityScreen.identityAllCard(0)).click();
    await IdentityCardDetailsScreen.loads();
  }
);

Given(
  /^user add (KERI) identity through plus icon$/,
  async function (identifierType: string) {
    this.identifierType = identifierType;
    this.identityName = await addChosenIdentityTypeByPlusIcon();
  }
);

When(
  /^user add (KERI) identity$/,
  async function (identifierType: string) {
    this.identifierType = identifierType;
    this.identityName = await addChosenIdentityType();
  }
);
