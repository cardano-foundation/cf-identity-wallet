import { Ionic$ } from '..';
import { ElementActionOptions } from '../..';
import { IonicComponent } from './component';

export interface OpenMenuOptions extends ElementActionOptions {
  delayForAnimation?: boolean;
}

export class IonicMenu extends IonicComponent {
  constructor(selector?: string) {
    super(selector || 'ion-menu');
  }

  get menuButton() {
    return Ionic$.$('.ion-page:not(.ion-page-hidden) ion-menu-button');
  }

  async open({
    delayForAnimation = true,
    visibilityTimeout = 5000,
  }: OpenMenuOptions = {}) {
    await (
      await this.menuButton
    ).waitForDisplayed({ timeout: visibilityTimeout });
    await (await this.menuButton).click();

    // Let the menu animate open/closed
    if (delayForAnimation) {
      return driver.pause(500);
    }
  }
}
