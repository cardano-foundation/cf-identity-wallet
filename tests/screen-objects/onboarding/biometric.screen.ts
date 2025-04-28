import { expect } from "expect-webdriverio";
import { Biometric } from "../../constants/text.constants";

export class BiometricScreen {
  get biometricPopup() {
    return $("[data-testid='alert-setup-biometry'] div.alert-wrapper.ion-overlay-wrapper.sc-ion-alert-md h2");
  }

  get confirmButton() {
    return $("[data-testid='alert-setup-biometry'] button#confirm-alert-button");
  }

  get cancelButton() {
    return $("[data-testid='alert-setup-biometry'] button#cancel-alert-button");
  }

  get cancelBiometricPopup() {
    return $("#alert-11-hdr")
  }

  get okButton() {
    return $("[data-testid='alert-cancel-biometry-confirm-button']");
  }

  async loads() {
    await expect(this.biometricPopup).toBeDisplayed();
    await expect(this.biometricPopup).toHaveText(Biometric.Description);
    await expect(this.confirmButton).toBeExisting();
    await expect(this.cancelButton).toBeExisting();
  }

  async cancelBiometricLoads() {
    await expect(this.biometricPopup).not.toBeDisplayed();
    await expect(this.cancelBiometricPopup).toBeDisplayed();
    await expect(this.cancelBiometricPopup).toHaveText(Biometric.DescriptionCancelBiometric)
  }

  async closeCancelBiometricPopup() {
    await expect(this.cancelBiometricPopup).not.toBeDisplayed();
  }
}

export default new BiometricScreen();