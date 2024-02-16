import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { Menu } from "./Menu";
import { store } from "../../../store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";

describe("Menu Tab", () => {
  test("Renders Menu Tab", () => {
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <Menu />
      </Provider>
    );

    expect(getByTestId("menu-tab")).toBeInTheDocument();
    expect(getByText(EN_TRANSLATIONS.menu.tab.header)).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.menu.tab.items.profile)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.menu.tab.items.crypto)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.menu.tab.items.connections)
    ).toBeInTheDocument();
    expect(getByText(EN_TRANSLATIONS.menu.tab.items.p2p)).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.menu.tab.items.identity)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.menu.tab.items.credentials)
    ).toBeInTheDocument();
  });
});
