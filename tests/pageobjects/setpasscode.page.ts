

import Page from "./page";
import {IonicButton} from "../helpers/ionic";

class SetPasscodePage extends Page {
  getNumberButton(number: number) {
    const selector = `[data-testid=passcode-button-${number}]`
    return new IonicButton(selector);
  }
}

export default new SetPasscodePage();
