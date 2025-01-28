import { Given, Then } from "@wdio/cucumber-framework";
import OnboardingScreen from "../../screen-objects/onboarding/onboarding.screen.js";

Given(/^user tap Get Started button on Onboarding screen$/, async function () {
  await OnboardingScreen.tapOnGetStartedButton();
});

Then(/^user can see Onboarding screen$/, async function () {
  await OnboardingScreen.loads();
});
