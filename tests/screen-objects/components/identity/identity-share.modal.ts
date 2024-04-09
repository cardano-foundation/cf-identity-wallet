import { expect } from "expect-webdriverio";
import { CommonIdentityModal } from "./common-identity.modal.js";

export class IdentityShareModal extends CommonIdentityModal {
  get copyButton() {
    return $("[data-testid=\"share-identifier-copy-button\"]");
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
    await expect(this.modalTitle).toHaveText("Share connection");
    await expect(this.qrCodeColumn).toBeDisplayed();
    await expect(this.copyButton).toBeDisplayed();
    await expect(this.copyButtonLabel).toHaveText("Copy Out-of-Band Invitation (OOBI)");
    await expect(this.moreOptionsButton).toBeDisplayed();
    await expect(this.moreOptionsButtonLabel).toHaveText("More share options");
  }
}

export default new IdentityShareModal();
