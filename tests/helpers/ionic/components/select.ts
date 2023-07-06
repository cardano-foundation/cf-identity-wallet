import { pause, waitForElement } from '../..';
import { IonicComponent } from './component';

export class IonicSelect extends IonicComponent {
  constructor(selector: string) {
    super(selector);
  }

  async open() {
    await (await this.$).click();
    // Wait for the alert to popup
    return pause(1000);
  }

  async select(n: number) {
    const options = await $$('.select-interface-option');

    return options[n]?.click();
  }

  async cancel() {
    const cancel = await waitForElement('.alert-button-role-cancel');
    await cancel.click();
    // Allow alert to close
    return cancel.waitForDisplayed({ reverse: true });
  }

  async ok() {
    const ok = await waitForElement(
      '.alert-button:not(.alert-button-role-cancel)'
    );
    await ok.click();
    // Allow alert to close
    return ok.waitForDisplayed({ reverse: true });
  }
}
