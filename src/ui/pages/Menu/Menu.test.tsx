import { fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { waitForIonicReact } from "@ionic/react-test-utils";
import { act } from "react-dom/test-utils";
import { Menu } from "./Menu";
import { store } from "../../../store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { SubMenuKey } from "./Menu.types";

describe("Menu Tab", () => {
  test("Renders Menu Tab", () => {
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <Menu />
      </Provider>
    );

    expect(getByTestId("menu-tab")).toBeInTheDocument();
    expect(getByText(EN_TRANSLATIONS.menu.header)).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.menu.items.profile.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.menu.items.crypto.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.menu.items.connections.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.menu.items.connectwallet.title)
    ).toBeInTheDocument();
  });

  test("Open connect wallet tab", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <Menu />
      </Provider>
    );

    expect(getByTestId("menu-tab")).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.menu.items.connectwallet.title)
    ).toBeInTheDocument();
    const connectButton = getByTestId(
      `menu-input-item-${SubMenuKey.ConnectWallet}`
    );

    act(() => {
      fireEvent.click(connectButton);
    });

    await waitForIonicReact();

    expect(
      getByText(EN_TRANSLATIONS.menu.items.connectwallet.tabheader)
    ).toBeVisible();
  });
});
