import { TapButtonOptions } from '.';
import { Ionic$ } from '..';
import { IonicComponent } from './component';

export class IonicItem extends IonicComponent {
  constructor(selector: string) {
    super(selector);
  }

  static withTitle(buttonTitle: string): IonicItem {
    return new IonicItem(`ion-item=${buttonTitle}`);
  }

  async tap({
    visibilityTimeout = 5000,
    scroll = true,
  }: TapButtonOptions = {}) {
    const button = await Ionic$.$(this.selector as string);
    await button.waitForDisplayed({ timeout: visibilityTimeout });
    if (scroll) {
      await button.scrollIntoView();
    }
    return button.click();
  }
}
