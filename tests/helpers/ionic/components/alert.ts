import { IonicComponent } from "./component";

export class IonicAlert extends IonicComponent {
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
