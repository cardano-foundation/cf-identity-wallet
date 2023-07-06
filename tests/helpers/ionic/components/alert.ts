import { IonicComponent } from './component';

export class IonicAlert extends IonicComponent {
  constructor(selector?: string | WebdriverIO.Element) {
    super(selector ?? 'ion-alert');
  }

  get input() {
    return $(this.selector).$(`.alert-input`);
  }

  async button(buttonTitle: string) {
    return $(this.selector).$(`button=${buttonTitle}`);
  }
}
