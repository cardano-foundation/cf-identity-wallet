import { ElementActionOptions } from './definitions';

export async function waitForElement(selector: string, { visibilityTimeout = 5000 }: ElementActionOptions = {}) {
  const el = await $(selector);
  await el.waitForDisplayed({ timeout: visibilityTimeout });
  return el;
}

export async function blur(selector: string, { visibilityTimeout = 5000 }: ElementActionOptions = {}) {
  return browser.execute((sel) => {
    const el = document.querySelector(sel);
    if (el) {
      (el as any).blur();
    }
  }, selector);
}

export async function tryAcceptAlert() {
  try {
    return driver.acceptAlert();
  } catch (e) {
    console.warn('No alert to accept');
  }
}
