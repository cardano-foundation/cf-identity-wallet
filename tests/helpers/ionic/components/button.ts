import { Ionic$ } from '..';
import { ElementActionOptions } from '../..';
import { IonicComponent } from './component';

export interface TapButtonOptions extends ElementActionOptions {
  /**
   * Whether to scroll the element into view first. Default: true
   */
  scroll?: boolean;
}

export class IonicButton extends IonicComponent {
  constructor(selector: string) {
    super(selector);
  }

  static withTitle(buttonTitle: string): IonicButton {
    return new IonicButton(`ion-button=${buttonTitle}`);
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
