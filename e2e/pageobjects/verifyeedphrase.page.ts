import Page from "./page";
import { IonicButton } from "../helpers/ionic";

class VerifySeedPhrasePage extends Page {
  getWordButton(word: string) {
    return new IonicButton(`[data-testid="remaining-word-${word}"]`);
  }
  getConfirmButton() {
    return new IonicButton('[data-testid="primary-button-verify-seedphrase"');
  }
}

export { VerifySeedPhrasePage };
