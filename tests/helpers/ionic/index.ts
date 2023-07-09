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
  /*
  static async $testid(testId: string): Promise<ExpectWebdriverIO.Element> {
    const activePage = await IonicPage.active();
    //const selector = `[data-testid="${testId}"]`;
    return activePage.$(selector);
  }*/
  static async $classname(classname: string): Promise<ExpectWebdriverIO.Element> {
    const activePage = await IonicPage.active();
    const selector = `.${classname}`;
    return activePage.$(selector);
  }
}

export * from "./components";
