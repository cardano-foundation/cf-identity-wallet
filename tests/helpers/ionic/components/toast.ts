import { IonicComponent } from './component';

export class IonicToast extends IonicComponent {
  constructor() {
    super('ion-toast');
  }

  getText() {
    return $(this.selector).getText();
  }
}
