import { log } from "./logger.js";
import { delay } from "../screen-objects/base.screen.js";

export function recoveryPhrase() {
  const phrase: string[] = [];

  const recoveryPhraseWordText = async (wordNumber: number) => {
    return $(`[data-testid="word-index-${wordNumber.toString()}"]`);
  };

  const save = async (phraseLength = 18) => {
    for (let i = 1; i <= phraseLength; i++) {
      const wordValue = await (await recoveryPhraseWordText(i)).getText();
      log.info(`Word number ${i}: ${wordValue}`);
      phrase.push(wordValue);
    }
    return phrase;
  };

  const emptyWordLocator = async (index: number) => {
    return $(`[data-testid=empty-word-${index + 1}]`);
  };

  const getWordValue = async (index: number) => {
    const wordValueLocator = $(
      `[data-testid="matching-seed-phrase-container"] [data-testid="word-index-${
        index + 1
      }"]`
    );
    await wordValueLocator.waitForClickable();
    return await wordValueLocator.getText();
  };

  const select = async (seedPhrase: string[]) => {
    await delay(100);
    for (let i = 0; i < seedPhrase.length; i++) {
      let wordValue: string;
      const locator = $('[data-testid="original-seed-phrase-container"]').$(
        `span=${seedPhrase[i]}`
      );

      await expect(locator).toBeDisplayed();
      await expect(await emptyWordLocator(i)).toBeDisplayed();
      do {
        await locator.waitForClickable({ timeout: 3000 });
        await locator.click();
        wordValue = await getWordValue(i);
      } while (wordValue !== seedPhrase[i]);
      await (await emptyWordLocator(i)).waitForDisplayed({ reverse: true });
    }
  };

  const getSavedPhrase = () => phrase;

  return {
    getSavedPhrase,
    save,
    select,
  };
}
