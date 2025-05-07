import { log } from "./logger.js";
import { delay } from "../screen-objects/base.screen.js";
import { recoveryPhrase } from "./recovery-phrase";
import { browser } from "@wdio/globals";

export function recoveryPhraseInMenu() {
  const enter = async (phrase: string[]) => {
    await delay(100);
    for (let i = 0; i < 18; i++) {
      const locator = $(
        `[data-testid="user-input-seed-phrase-container"] [data-testid="word-input-${i.toString()}"] > label > div > input`
      );

      await locator.waitForDisplayed();
      await locator.waitForClickable();
      await locator.click();
      await browser.keys([String(phrase[i])]);
      log.info(`Entered word ${i + 1}: ${phrase[i]}`);
    }
  };

  return {
    enter,
  };
}
