import { expect } from "expect-webdriverio";

export class MenuEditProfileScreen {

    get cancelButton() {
        return $("[data-testid=\"close-button\"]");
    }

    get confirmButton() {
        return $("[data-testid=\"action-button\"]");
    }

    get userNameTextBox() {
        return $("[data-testid=\"profile-item-edit-name\"] > label > div > input");
    }

    async tapOnCancelButton() {
        await expect(this.cancelButton).toBeDisplayed();
        await expect(this.cancelButton).toBeEnabled();
        await this.cancelButton.click();
    }

    async tapOnConfirmButton() {
        await expect(this.confirmButton).toBeDisplayed();
        await expect(this.confirmButton).toBeEnabled();
        await this.confirmButton.click();
    }

    async clickClearEnterNewUserNameTextBox(newUsername: string) {
        await expect(this.userNameTextBox).toBeDisplayed();
        await expect(this.userNameTextBox).toBeEnabled();
        await this.userNameTextBox.click();
        await this.userNameTextBox.clearValue()
        await this.userNameTextBox.setValue(newUsername);
    }
}

export default new MenuEditProfileScreen();
