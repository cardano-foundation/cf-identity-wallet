

import Page from "./page";
import {IonicButton} from "../helpers/ionic";

class GenerateSeedPhrasePage extends Page {

  getTermsAndConditionsCheckBox() {
    return new IonicButton(`termsandconditions-checkbox`);
  }
  getRevealSeedPhraseButton() {
    return new IonicButton(`reveal-seed-phrase-button`);
  }
  getSeedWord(position: number) {
    return new IonicButton(`word-index-${position}`);
  }
}

export default new GenerateSeedPhrasePage();
