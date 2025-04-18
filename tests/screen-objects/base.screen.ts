import Gestures from "../helpers/gestures";

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const findFilterAndClickElement = async (locator: string) => {
  await delay(100);
  await $(locator).waitForExist();
  const element = await $$(locator).filter((element) => element.isClickable());
  await element[0].click();
};

export const findAndClickLocator = async (locator: string) => {
  const element = await $(locator);
  await element.waitForExist();
  await element.waitForDisplayed();
  await element.waitForClickable();
  await element.click();
};
