import {IonicComponent} from './component';
import {Ionic$} from "../index";

export class IonicContent extends IonicComponent {
  constructor(selector: string) {
    super(selector);
  }
  static async getById (id: string) {
    const selector = `[data-testid="${id}"]`;
    const button = await Ionic$.$(selector);
    return await button.getHTML(false)

  }
}
