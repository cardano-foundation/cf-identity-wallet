

import Page from "./page";
import {IonicButton, IonicContent} from "../helpers/ionic";
import {IonicAlert} from "../helpers/ionic/components/alert";

class GenerateSeedPhrasePage extends Page {

  getTermsAndConditionsCheckBox() {
    const selector = `[data-testid="${`termsandconditions-checkbox`}"]`;
    return new IonicButton(selector);
  }
  getRevealSeedPhraseButton() {
    return new IonicButton( `[data-testid="${`reveal-seed-phrase-button`}"]`);
  }
  getSeedWord(position: number) {
    return IonicContent.getById(`word-index-${position}`);
  }

  getContinueButton() {
    return new IonicButton(`[data-testid="${`continue-button`}"]`);
  }
  async getConfirmButton() {
    const alert = new IonicAlert();
    return alert.classname(".alert-button-role-confirm");
  }

}

export default new GenerateSeedPhrasePage();
