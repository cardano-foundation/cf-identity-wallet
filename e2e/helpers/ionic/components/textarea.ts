import { IonicComponent } from "./component";
export class IonicTextarea extends IonicComponent {
  constructor(selector: string) {
    super(selector);
  }

  setValue(value: string) {

    return browser.execute(
      (selector: string, valueString: string) => {
        const el = document.querySelector(selector);
        if (el) {
          (el as any).value = valueString;
        }
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.selector,
      value
    );
  }

  getValue() {
    return browser.execute((selector: string) => {
      const el = document.querySelector(selector);
      if (el) {
        return (el as any).value;
      }
      return null;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    }, this.selector);
  }
}
