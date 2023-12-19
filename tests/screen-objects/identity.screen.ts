import { expect } from "expect-webdriverio";
import MenuToolbar from "./components/menu.toolbar.js";
import TabBar from "./components/tab.bar.js";

export class IdentityScreen {
  get addAnIdentifierButton() {
    return $("[data-testid=\"identifiers-cards-placeholder-button\"]");
  }

  get screenTitle() {
    return $("[data-testid=\"tab-title-identity\"]");
  }

  async loads() {
    await expect(this.screenTitle).toBeDisplayed();
    await MenuToolbar.loads("identity");
    await expect(this.addAnIdentifierButton).toBeDisplayed();
    await TabBar.loads();
  }
}

export default new IdentityScreen();
