import { IonicComponent } from './component';

import { TapButtonOptions } from './button';
import { Ionic$ } from '..';

export class IonicSegment extends IonicComponent {
  constructor(selector: string | WebdriverIO.Element) {
    super(selector);
  }

  async button(buttonTitle: string) {
    const segmentButtons = await (await this.$).$$('ion-segment-button');
    for (const button of segmentButtons) {
      if (
        (await button.getText()).toLocaleLowerCase() ===
        buttonTitle.toLocaleLowerCase()
      ) {
        return new IonicSegmentButton(button);
      }
    }
    return Promise.resolve(null);
  }
}

export class IonicSegmentButton extends IonicComponent {
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
