import { IonicComponent } from "./component";
import { Ionic$ } from "../index";
import { ElementActionOptions } from "../../index";

export class IonicInput extends IonicComponent {
  constructor(selector: string) {
    super(selector);
  }

  async setValue(
    value: string,
    { visibilityTimeout = 5000 }: ElementActionOptions = {}
  ) {
    const el = await Ionic$.$(this.selector as string);
    await el.waitForDisplayed({ timeout: visibilityTimeout });

    const ionTags = ["ion-input", "ion-textarea"];
    if (ionTags.indexOf(await el.getTagName()) >= 0) {
      const input = await el.$("input,textarea");
      await input.setValue(value);
    } else {
      return el.setValue(value);
    }
  }

  async getValue({ visibilityTimeout = 5000 }: ElementActionOptions = {}) {
    const el = await Ionic$.$(this.selector as string);
    await el.waitForDisplayed({ timeout: visibilityTimeout });

    const ionTags = ["ion-input", "ion-textarea"];
    if (ionTags.indexOf(await el.getTagName()) >= 0) {
      const input = await el.$("input,textarea");
      return input.getValue();
    } else {
      return el.getValue();
    }
  }
}
