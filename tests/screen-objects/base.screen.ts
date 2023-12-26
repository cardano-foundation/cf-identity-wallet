const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const findAndClickElement = async (locator: string) => {
  await delay(100);
  await $(locator).waitForExist();
  const element = await $$(locator).filter((element) => element.isClickable());
  await element[0].click();
};
