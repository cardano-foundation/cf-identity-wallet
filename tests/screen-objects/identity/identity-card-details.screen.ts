import { expect } from "expect-webdriverio";
import { cardDetails } from "../../helpers/card-details.js";
import { KeyIdentifierType } from "../../constants/keyIdentifier.types.js";

export class IdentityCardDetailsScreen {
  identifierParentLocator =
    "[data-testid=\"identifier-card-template-default-index-0\"]";

  get alertModal() {
    return "[data-testid=\"alert-confirm-identifier-delete-details\"]";
  }

  get deleteIdentifierButton() {
    return $("[data-testid=\"delete-button-identifier-card-details\"]");
  }

  get favouriteButton() {
    return $("[data-testid=\"heart-button\"]");
  }

  get optionsButton() {
    return $("[data-testid=\"identifier-options-button\"]");
  }

  get shareButton() {
    return $("[data-testid=\"share-button\"]");
  }

  async cardBlockButtonFor(blockName: string) {
    return $(`[data-testid="${blockName}-copy-button"]`);
  }

  async cardBlockTextValueFor(blockName: string) {
    return $(`[data-testid="${blockName}-text-value"]`);
  }

  async cardBlockTitleFor(blockName: string) {
    return $(`[data-testid="card-block-title-${blockName}"]`);
  }

  async cardCreationDateText(index: number, parentElement = "") {
    return $(`${parentElement} [data-testid="card-created-${index}"]`);
  }

  async cardDisplayNameText(index: number, parentElement = "") {
    return $(`${parentElement} [data-testid="card-display-name-${index}"]`);
  }

  async cardKeyTypeText(index: number, parentElement = "") {
    return $(`${parentElement} [data-testid="card-key-${index}"]`);
  }

  async assertDisplayName(editedIdentityName: string) {
    await expect(
      await this.cardDisplayNameText(0, this.identifierParentLocator)
    ).toHaveText(editedIdentityName);
  }

  async loads(identifierType: string) {
    await expect(await this.favouriteButton).toBeDisplayed();
    await expect(await this.shareButton).toBeDisplayed();
    await expect(await this.optionsButton).toBeDisplayed();
    await expect(
      await this.cardCreationDateText(0, this.identifierParentLocator)
    ).toBeDisplayed();
    await expect(
      await this.cardDisplayNameText(0, this.identifierParentLocator)
    ).toBeDisplayed();
    await expect(await this.deleteIdentifierButton).toBeExisting();
    switch (identifierType) {
    case KeyIdentifierType.DIDKEY:
      await cardDetails().cardBlocksForDidKey();
      return;
    case KeyIdentifierType.KERI:
      await cardDetails().cardBlocksForKeri();
      return;
    }
  }
}

export default new IdentityCardDetailsScreen();
