import { IonicPage } from "./components";


export class Ionic$ {
  static async $(selector: string): Promise<ExpectWebdriverIO.Element> {
    const activePage = await IonicPage.active();
    return activePage.$(selector);
  }

  static async $$(selector: string): Promise<WebdriverIO.Element[]> {
    const activePage = await IonicPage.active();
    return activePage.$$(selector);
  }
}

export * from "./components";
