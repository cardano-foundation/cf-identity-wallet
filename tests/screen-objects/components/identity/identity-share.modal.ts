import { expect } from "expect-webdriverio";

export class IdentityShareModal {
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
    return $("[data-testid=\"share-identifier-title\"]");
  }

  get qrCodeColumn() {
    return $("[data-testid=\"share-identifier-qr-code\"]");
  }

  async loads() {
    await expect(this.modalTitle).toHaveText("Share identifier");
    await expect(this.qrCodeColumn).toBeDisplayed();
    await expect(this.copyButton).toBeDisplayed();
    await expect(this.copyButtonLabel).toHaveText("Copy Identifier");
    await expect(this.moreOptionsButton).toBeDisplayed();
    await expect(this.moreOptionsButtonLabel).toHaveText("More share options");
  }
}

export default new IdentityShareModal();
