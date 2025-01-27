import { expect } from "expect-webdriverio";
import MenuToolbar from "../components/menu.toolbar.js";
import TabBar from "../components/tab.bar.js";

export class IdentifiersScreen {
  get addAnIdentifierButton() {
    return $("[data-testid=\"primary-button-identifiers-tab\"]");
  }

  get screenTitle() {
    return $("[data-testid=\"tab-title-identifiers\"]");
  }

  async identityAllCard(index: number) {
    return $(
      `[data-testid="identifier-card-template-allidentifiers-index-${index}"]`
    );
  }

  async identityFavouriteCard(index: number) {
    return $(`[data-testid="identifier-card-template-favs-index-${index}"]`);
  }

  async loads(isScreenEmpty = true, cardQuantity = 0) {
    await expect(this.screenTitle).toBeDisplayed();
    await MenuToolbar.loads();
    if (isScreenEmpty) await expect(this.addAnIdentifierButton).toBeDisplayed();
    else {
      for (let i = 0; i < cardQuantity; i++) {
        await expect(await this.identityAllCard(i)).toBeDisplayed();
      }
    }
    await TabBar.loads();
  }
}

export default new IdentifiersScreen();
