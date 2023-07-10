import { $ } from "@wdio/globals";
import { IonicComponent } from "./component";

export class IonicAlert extends IonicComponent {
  // eslint-disable-next-line no-undef
  constructor(selector?: string | WebdriverIO.Element) {
    super(selector ?? "ion-alert");
  }

  get input() {
    return $(this.selector).$(".alert-input");
  }
  classname(classname: string) {
    return $(this.selector).$(classname);
  }

  async button(buttonTitle: string) {
    return $(this.selector).$(`button=${buttonTitle}`);
  }
}
