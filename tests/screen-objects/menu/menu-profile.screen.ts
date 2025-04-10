import { expect } from "expect-webdriverio";

export class MenuProfileScreen {
    get profileNameItem() {
        return $("[data-testid=\"profile-item-view-name\"]");
    }

    get profileItem() {
        return $("[data-testid=\"tab-title-menu\"]");
    }

    get editButton() {
        return $("[data-testid=\"action-button\"]");
    }

    get userNameText() {
        return $("[data-testid=\"profile-item-view-name\"] > span:nth-of-type(2)");
    }

    async loads() {
        await expect(this.profileItem).toBeDisplayed();
        await expect(this.profileNameItem).toBeDisplayed();
    }

    async tapOnEditButton() {
        await expect(this.editButton).toBeDisplayed();
        await expect(this.editButton).toBeEnabled();
        await this.editButton.click();
    }
}

export default new MenuProfileScreen();
