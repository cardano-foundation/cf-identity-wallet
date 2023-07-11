

import Page from "./page";
import {IonicButton} from "../helpers/ionic";

class OnboardingPage extends Page {
  get getStartedButton() {
    return new IonicButton(`[data-testid="${"get-started-button"}"]`);
  }
}

export {
  OnboardingPage
}
