import { Given, Then, When } from "@wdio/cucumber-framework";
import MenuVerifyYourRecoveryPhraseScreen from "../../screen-objects/menu/menu-verify-recovery-phrase.screen.js";
import { recoveryPhraseInMenu } from "../../helpers/menu-recovery-phrase";
import { expect } from "expect-webdriverio";
import { VerifyYourRecoveryPhrase } from "../../constants/text.constants";

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

When(
  /^user tap on cancel button in the Menu Verify Your Phrase Screen$/,
  async function () {
    await MenuVerifyYourRecoveryPhraseScreen.cancelButton.click();
  }
);

When(
  /^user wrongly verify all the recovery phrase in Verify Your Recovery Phrase screen from Menu screen$/,
  async function () {
    await recoveryPhraseInMenu().enter(
      (global as any).recoveryPhraseWords.reverse()
    );
    await MenuVerifyYourRecoveryPhraseScreen.verifyButton.click();
  }
);

Then(/^user can see wrong recovery phrase popup$/, async function () {
  await MenuVerifyYourRecoveryPhraseScreen.wrongRecoveryPhrasePopupLoads();
});
