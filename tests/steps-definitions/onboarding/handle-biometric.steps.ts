import { Given} from "@wdio/cucumber-framework";
import BiometricScreen from "../../screen-objects/onboarding/biometric.screen";

Given(/^user skip Biometric popup if it exist$/, async function() {
  if (await BiometricScreen.biometricWarningText.isExisting()) {
    await BiometricScreen.loads();
    await BiometricScreen.handleBiometricPopup();
  }
});