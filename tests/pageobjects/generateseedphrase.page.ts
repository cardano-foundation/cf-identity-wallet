

import Page from "./page";
import {IonicButton} from "../helpers/ionic";

class GenerateSeedPhrasePage extends Page {

  getTermsAndConditionsCheckBox() {
    return new IonicButton(`termsandconditions-checkbox`);
  }
}

export default new GenerateSeedPhrasePage();
