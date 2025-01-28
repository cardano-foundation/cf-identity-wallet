import { expect } from "expect-webdriverio";
import { CommonIdentifierModal } from "./common-identifier.modal.js";

export class IdentifierShareModal extends CommonIdentifierModal {
  get copyButton() {
    return $("[data-testid=\"share-identifier-copy-button\"]");
  }

  get copyButton2() {
    return $(".share-identifier-option");
  }

  get copyButtonLabel() {
    return $("[data-testid=\"share-identifier-copy-label\"]");
  }

  get moreOptionsButton() {
    return $("[data-testid=\"share-identifier-more-button\"]");
  }

  get moreOptionsButtonLabel() {
    return $("[data-testid=\"share-identifier-more-label\"]");
  }

  get modalTitle() {
    return this.modalTitleElement("share-connection");
  }

  get qrCodeColumn() {
    return $("[data-testid=\"share-identifier-qr-code\"]");
  }

  async loads() {
    await expect(await this.modalTitle).toHaveText("Share connection");
    await expect(this.qrCodeColumn).toBeDisplayed();
    await expect(this.copyButton).toBeDisplayed();
    await expect(this.copyButtonLabel).toHaveText("Copy connection URL");
    await expect(this.moreOptionsButton).toBeDisplayed();
    await expect(this.moreOptionsButtonLabel).toHaveText("More share options");
  }
}

export default new IdentifierShareModal();
