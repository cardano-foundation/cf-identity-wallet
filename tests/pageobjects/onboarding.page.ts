

import Page from "./page";
import {IonicButton} from "../helpers/ionic";

class Onboarding extends Page {
  get getStartedButton() {
    return new IonicButton("get-started-button");
  }
}

export default new Onboarding();
