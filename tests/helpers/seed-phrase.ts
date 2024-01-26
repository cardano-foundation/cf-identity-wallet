import GenerateSeedPhraseScreen from "../screen-objects/generate-seed-phrase.screen.js";
import { log } from "./logger.js";

export function seedPhrase() {
  const phrase: string[] = [];
  const save = async (phraseLength: number) => {
    for (let i = 1; i <= phraseLength; i++) {
      const wordValue = await GenerateSeedPhraseScreen.seedPhraseWordText(
        i
      ).getText();
      log.info(`Word number ${i}: ${wordValue}`);
      phrase.push(wordValue);
    }
    return phrase;
  };

  const select = async (seedPhrase: string[]) => {
    for (let i = 0; i < seedPhrase.length; i++) {
      const locator = `span=${seedPhrase[i]}`;
      await $(locator).click();
    }
  };

  return {
    save,
    select,
  };
}
