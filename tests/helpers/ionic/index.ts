import { IonicPage } from "./components";

export class Ionic$ {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-undef
  static async $(selector: string): Promise<ExpectWebdriverIO.Element> {
    const activePage = await IonicPage.active();
    return activePage.$(selector);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-undef
  static async $$(selector: string): Promise<WebdriverIO.Element[]> {
    const activePage = await IonicPage.active();
    return activePage.$$(selector);
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line no-undef
  static async $classname(classname: string): Promise<ExpectWebdriverIO.Element> {
    const activePage = await IonicPage.active();
    const selector = `.${classname}`;
    return activePage.$(selector);
  }
}

export * from "./components";
