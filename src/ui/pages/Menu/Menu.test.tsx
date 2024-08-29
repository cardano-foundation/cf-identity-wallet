import { fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { waitForIonicReact } from "@ionic/react-test-utils";
import configureStore from "redux-mock-store";
import { act } from "react-dom/test-utils";
import { Menu } from "./Menu";
import { store } from "../../../store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { SubMenuKey } from "./Menu.types";

const mockStore = configureStore();
const dispatchMock = jest.fn();
const initialState = {
  stateCache: {
    routes: ["/"],
    authentication: {
      loggedIn: true,
      userName: "Frank",
      time: Date.now(),
      passcodeIsSet: true,
    },
  },
};

const storeMocked = {
  ...mockStore(initialState),
  dispatch: dispatchMock,
};

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
      getByText(EN_TRANSLATIONS.menu.tab.items.profile.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.menu.tab.items.crypto.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.menu.tab.items.connections.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.menu.tab.items.connectwallet.title)
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
      getByText(EN_TRANSLATIONS.menu.tab.items.connectwallet.title)
    ).toBeInTheDocument();
    const connectButton = getByTestId(
      `menu-input-item-${SubMenuKey.ConnectWallet}`
    );

    act(() => {
      fireEvent.click(connectButton);
    });

    await waitForIonicReact();

    expect(
      getByText(EN_TRANSLATIONS.menu.tab.items.connectwallet.tabheader)
    ).toBeVisible();
  });

  test("Open Profile tab", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <Menu />
      </Provider>
    );

    expect(getByTestId("menu-tab")).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.menu.tab.items.profile.title)
    ).toBeInTheDocument();
    const profileButton = getByTestId(`menu-input-item-${SubMenuKey.Profile}`);

    act(() => {
      fireEvent.click(profileButton);
    });

    await waitForIonicReact();

    expect(getByTestId("profile-title")).toHaveTextContent(
      EN_TRANSLATIONS.menu.tab.items.profile.tabheader
    );
  });
});
