import { Given, Then, When } from "@wdio/cucumber-framework";
import MenuVerifyYourRecoveryPhraseScreen from "../../screen-objects/menu/menu-verify-recovery-phrase.screen.js";
import { recoveryPhraseInMenu } from "../../helpers/menu-recovery-phrase";

Then(
  /^user can see Verify Your Recovery Phrase screen from Menu screen$/,
  async function () {
    await MenuVerifyYourRecoveryPhraseScreen.loads();
  }
);

When(
  /^user verify all the recovery phrase in Verify Your Recovery Phrase screen from Menu screen$/,
  async function () {
    await recoveryPhraseInMenu().enter((global as any).recoveryPhraseWords);
    await MenuVerifyYourRecoveryPhraseScreen.verifyButton.click();
  }
);
