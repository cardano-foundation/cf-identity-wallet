export class IonicComponent {
  constructor(public selector: string | WebdriverIO.Element) {
  }

  get $() {
    return import("./page").then(async ({ IonicPage }) => {
      if (typeof this.selector === "string") {
        const activePage = await IonicPage.active();
        return activePage.$(this.selector);
      }

      return this.selector;
    });
  }
  static getByText (text: string) {
    return import("./page").then(async ({ IonicPage }) => {
      if (typeof text === "string") {
        const activePage = await IonicPage.active();
        return activePage.selectByVisibleText(text);
      }

      return text;
    });
  }
}
