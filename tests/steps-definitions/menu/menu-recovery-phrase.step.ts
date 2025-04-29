import { When } from "@wdio/cucumber-framework";
import MenuRecoveryPhraseScreen from "../../screen-objects/menu/menu-recovery-phrase.screen";

When(/^user tap on Back Button on Recovery Phrase screen$/, async function () {
  await MenuRecoveryPhraseScreen.backButton.click();
});

When(
  /^user tap on (View|Hide) Recovery Button on Recovery Phrase screen$/,
  async function (dummy: string) {
    await MenuRecoveryPhraseScreen.viewButton.click();
  }
);

When(/^user can see Recovery Phrase Screen$/, async function () {
  await MenuRecoveryPhraseScreen.loads();
});

When(
  /^user (see|cannot see) all 18 recovery phrase$/,
  async function (status: string) {
    await MenuRecoveryPhraseScreen.recoveryPhraseVisibility(status);
  }
);
