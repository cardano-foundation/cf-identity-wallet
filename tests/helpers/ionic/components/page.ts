import { IonicComponent } from './component';

export class IonicPage extends IonicComponent {
  static async active() {
    await driver.waitUntil(
      async () => {
        const currentPages = await $$('.ion-page:not(.ion-page-hidden)');
        for (const page of currentPages) {
          if ((await page.isDisplayed())) {
            return true;
          }
        }
        return false;
      }, {
      timeout: 10000,
      timeoutMsg: 'Unable to find any visible pages',
      interval: 500,
    }
    );

    const allPages = await $$('.ion-page:not(.ion-page-hidden)');

    const pages: WebdriverIO.Element[] = [];

    // Collect visible pages
    for (const page of allPages) {
      if ((await page.isDisplayed())) {
        pages.push(page);
      }
    }

    // Collect all the visible pages in the app
    const pagesAndParents: WebdriverIO.Element[][] = [];
    for (const page of pages) {
      const path = await this.getPath(page);
      pagesAndParents.push(path);
    }

    // Reverse sort the pages by the ones that have the most parent elements first, since
    // we assume pages deeper in the tree are more likely to be "active" than ones higher up
    const activePage = pagesAndParents.sort((a, b) => b.length - a.length)[0][0];

    return activePage;
  }

  static async getPath(el: WebdriverIO.Element) {
    const path = [el];

    let p = el;
    while (p) {
      p = await p.parentElement();
      if (p.error) {
        break;
      }
      path.push(p);
    }

    return path;
  }
}
