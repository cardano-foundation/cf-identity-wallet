

import Page from "./page";
import {IonicButton} from "../helpers/ionic";

class SetPasscodePage extends Page {
  getNumberButton(number: number) {
    return new IonicButton(`passcode-button-${number}`);
  }
}

export default new SetPasscodePage();
