import { expect } from "expect-webdriverio";

export class MenuOperationPasswordScreen {

    get alertModal() {
        return "[data-testid=\"alert-cancel-enable-password-cancel-button\"]";
    }

    get backButton() {
        return $("[data-testid=\"close-button\"]");
    }

    get operationPasswordButton() {
        return $("[data-testid=\"settings-item-toggle-password\"] > ion-toggle");
    }

    get operationPasswordText() {
        return $("[data-testid=\"settings-item-toggle-password\"]");
    }

    get managePasswordText() {
        return $("[data-testid=\"manage-password-title\"]");
    }

    async tapOnBackButton() {
        await expect(this.backButton).toBeDisplayed();
        await expect(this.backButton).toBeEnabled();
        await this.backButton.click();
    }

    async tapOnOperationPasswordButton() {
        await expect(this.operationPasswordButton).toBeDisplayed();
        await expect(this.operationPasswordButton).toBeEnabled();
        await this.operationPasswordButton.click();
    }

    async loads() {
        await expect(this.operationPasswordButton).toBeDisplayed();
        await expect(this.backButton).toBeDisplayed();
        await expect(this.operationPasswordText).toBeDisplayed();
        await expect(this.managePasswordText).toBeDisplayed();
    }
}

export default new MenuOperationPasswordScreen();
