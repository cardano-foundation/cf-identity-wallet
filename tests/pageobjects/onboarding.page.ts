

import Page from "./page";
import {Ionic$, IonicButton, IonicSelect} from "../helpers/ionic";

class About extends Page {
  get popoverButton() {
    return new IonicButton("ion-buttons > ion-button");
  }
  get headerImage() {
    return Ionic$.$(".about-header");
  }
  get madisonImage() {
    return Ionic$.$(".madison");
  }
  get austinImage() {
    return Ionic$.$(".austin");
  }
  get chicagoImage() {
    return Ionic$.$(".chicago");
  }
  get seattleImage() {
    return Ionic$.$(".seattle");
  }
  get locationSelect() {
    return new IonicSelect("ion-select");
  }
}

export default new About();
