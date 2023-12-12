export const findAndClickElement = async (locator: string) => {
  const element = await $$(locator).filter((element) => element.isClickable());
  await element[0].click();
};
