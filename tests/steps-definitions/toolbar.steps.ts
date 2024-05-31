import { Given, When } from "@wdio/cucumber-framework";
import CreatePasswordScreen from "../screen-objects/create-password.screen.js";
import MenuToolbar from "../screen-objects/components/menu.toolbar.js";
import PasscodeScreen from "../screen-objects/passcode.screen.js";
import SeedPhraseGenerateScreen from "../screen-objects/seed-phrase/seed-phrase-generate.screen.js";
import SeedPhraseVerifyScreen from "../screen-objects/seed-phrase/seed-phrase-verify.screen.js";

Given(
  /^user tap (Add|Plus) button on the screen$/,
  async function (dummy: string) {
    await MenuToolbar.addButton.click();
  }
);

Given(/^user tap Back arrow icon on the screen$/, async function () {
  await MenuToolbar.clickBackArrowIcon();
});

Given(/^user tap Back arrow icon on Passcode screen$/, async function () {
  await MenuToolbar.clickBackArrowButtonOf(PasscodeScreen.id);
});

Given(
  /^user tap Back arrow icon on Create Password screen$/,
  async function () {
    await MenuToolbar.clickBackArrowButtonOf(CreatePasswordScreen.id);
  }
);

Given(
  /^user tap Back arrow icon on Seed Phrase Generate screen$/,
  async function () {
    await MenuToolbar.clickBackArrowButtonOf(SeedPhraseGenerateScreen.id);
  }
);

When(
  /^user tap Back arrow icon on Seed Phrase Verify screen$/,
  async function () {
    await MenuToolbar.clickBackArrowButtonOf(SeedPhraseVerifyScreen.id);
  }
);
