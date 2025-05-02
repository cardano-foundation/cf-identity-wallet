import { expect } from "expect-webdriverio";
import { Biometric } from "../../constants/text.constants";

export class BiometricScreen {
  get biometricWarningText() {
    return $("[data-testid='alert-setup-biometry'] .alert-title.sc-ion-alert-md")
  }

  get confirmButton() {
    return $("[data-testid='alert-setup-biometry-confirm-button']");
  }

  get cancelButton() {
    return $("[data-testid='alert-setup-biometry-cancel-button']");
  }

  get cancelBiometricText() {
    return $("[data-testid='alert-cancel-biometry'] .alert-title.sc-ion-alert-md")
  }

  get okButton() {
    return $("[data-testid='alert-cancel-biometry-confirm-button']");
  }

  async loads() {
    await expect(this.biometricWarningText).toBeDisplayed();
    await expect(this.biometricWarningText).toHaveText(Biometric.Description);
    await expect(this.confirmButton).toBeExisting();
    await expect(this.cancelButton).toBeExisting();
  }

  async cancelBiometricLoads() {
    await expect(this.biometricWarningText).not.toBeDisplayed();
    await expect(this.cancelBiometricText).toBeDisplayed();
    await expect(this.cancelBiometricText).toHaveText(Biometric.DescriptionCancelBiometric)
  }

  async handleBiometricPopup() {
    await this.cancelButton.click();
    await this.cancelBiometricLoads();
    await this.okButton.click();
  }
}

export default new BiometricScreen();