import { Given, When, Then } from "@wdio/cucumber-framework";
import MenuScreen from "../../screen-objects/menu/menu.screen";
import MenuSettingsScreen from "../../screen-objects/menu/menu-settings.screen";
import MenuSettingsSupportScreen from "../../screen-objects/menu/menu-settings-support.screen";
import { browser } from '@wdio/globals';

Given(/^user click on Settings icon$/, async function() {
  await MenuScreen.settingsButton.click();
});

When(/^user scroll to app version in menu setting screen$/, async function() {
  await MenuSettingsScreen.appVersionItem.scrollIntoView();
});

Then(/^user can see app version$/, async function() {
  await MenuSettingsScreen.checkAppVersionIsDisplayed();
});

When(/^user click on term and privacy button in menu setting screen$/, async function() {
  await MenuSettingsScreen.termsAndPrivacyPolicyItem.click();
  await MenuSettingsSupportScreen.loadsTermsAndPrivacyScreen();
});

When(/^user click privacy policy button$/, async function() {
  await MenuSettingsSupportScreen.privacyPolicyItem.click();
});

When(/^user click Done button$/, async function() {
  await MenuSettingsSupportScreen.doneButton.click()
});

Then(/^user see term and privacy screen$/, async function() {
  await MenuSettingsSupportScreen.loadsTermsAndPrivacyScreen();
});

When(/^user click back button$/, async function() {
  await MenuSettingsSupportScreen.backButton.click();
});

Then(/^user got navigate back to setting screen$/, async function() {
  await MenuSettingsScreen.loads();
});

When(/^user click term of use button$/, async function() {
  await MenuSettingsSupportScreen.termsOfUseItem.click();
});

When(/^user click on Veridian Support Portal$/, async function() {
  await MenuSettingsScreen.connectViaDiscordItem.click()
});

Then(/^user got navigate to Veridian Support Portal$/, async function() {

});

When(/^user click on learn more$/, async function() {
  await MenuSettingsScreen.learnMoreItem.click();
});

Then(/^user got navigate to a website$/, async function() {
  const currentUrl = await browser.getUrl();
  expect(currentUrl).toContain("https://docs.veridian.id/");

});
