import { fireEvent, render, waitFor } from "@testing-library/react";
import { act } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { TabsRoutePath } from "../../../routes/paths";
import { store } from "../../../store";
import { showConnections } from "../../../store/reducers/stateCache";
import { connectionsFix } from "../../__fixtures__/connectionsFix";
import { filteredIdentifierFix } from "../../__fixtures__/filteredIdentifierFix";
import { CHAT_LINK, CRYPTO_LINK } from "../../globals/constants";
import { Menu } from "./Menu";
import { SubMenuKey } from "./Menu.types";

const combineMock = jest.fn(() => TabsRoutePath.MENU);
const historyPushMock = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => ({
    push: (args: unknown) => {
      historyPushMock(args);
    },
    location: {
      pathname: combineMock(),
    },
  }),
}));

const browserMock = jest.fn(({ link }: { link: string }) =>
  Promise.resolve(link)
);
jest.mock("@capacitor/browser", () => ({
  ...jest.requireActual("@capacitor/browser"),
  Browser: {
    open: (params: never) => browserMock(params),
  },
}));

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
    showConnections: false,
  },
  biometricsCache: {
    enable: false,
  },
  connectionsCache: {
    connections: connectionsFix,
  },
  walletConnectionsCache: {
    showConnectWallet: false,
  },
  identifiersCache: {
    identifiers: filteredIdentifierFix,
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
    expect(getByText(EN_TRANSLATIONS.tabs.menu.tab.header)).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.tabs.menu.tab.items.profile.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.tabs.menu.tab.items.crypto.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.tabs.menu.tab.items.connections.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.tabs.menu.tab.items.connectwallet.title)
    ).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.tabs.menu.tab.items.chat.title)
    ).toBeInTheDocument();
  });

  test("Open Profile sub-menu", async () => {
    const { getByTestId, getByText, unmount } = render(
      <Provider store={storeMocked}>
        <Menu />
      </Provider>
    );

    expect(getByTestId("menu-tab")).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.tabs.menu.tab.items.profile.title)
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(getByTestId("settings-button"));
    });

    await waitFor(() => {
      expect(getByTestId("settings-security-items")).toBeVisible();
    })

    unmount();
  });

  test("Open Profile sub-menu", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <Menu />
      </Provider>
    );

    expect(getByTestId("menu-tab")).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.tabs.menu.tab.items.profile.title)
    ).toBeInTheDocument();
    const profileButton = getByTestId(`menu-input-item-${SubMenuKey.Profile}`);

    act(() => {
      fireEvent.click(profileButton);
    });

    await waitFor(() => {
      expect(getByTestId("profile-title")).toHaveTextContent(
        EN_TRANSLATIONS.tabs.menu.tab.items.profile.tabheader
      );
    })
  });

  test("Open Crypto link", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <Menu />
      </Provider>
    );

    expect(getByTestId("menu-tab")).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.tabs.menu.tab.items.crypto.title)
    ).toBeInTheDocument();
    const cryptoButton = getByTestId(`menu-input-item-${SubMenuKey.Crypto}`);

    act(() => {
      fireEvent.click(cryptoButton);
    });

    await waitFor(() => {
      expect(browserMock).toBeCalledWith({
        url: CRYPTO_LINK,
      });
    });
  });

  test("Open Connections view", async () => {
    const { getByTestId, getByText } = render(
      <MemoryRouter initialEntries={[TabsRoutePath.MENU]}>
        <Provider store={storeMocked}>
          <Menu />
        </Provider>
      </MemoryRouter>
    );

    expect(getByTestId("menu-tab")).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.tabs.menu.tab.items.connections.title)
    ).toBeInTheDocument();
    const connectionsButton = getByTestId(
      `menu-input-item-${SubMenuKey.Connections}`
    );
    act(() => {
      fireEvent.click(connectionsButton);
    });

    await waitFor(() => {
      expect(dispatchMock).toBeCalledWith(showConnections(true));
    });
  });

  test("Open Cardano connect sub-menu", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <Menu />
      </Provider>
    );

    expect(getByTestId("menu-tab")).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.tabs.menu.tab.items.connectwallet.title)
    ).toBeInTheDocument();
    const connectButton = getByTestId(
      `menu-input-item-${SubMenuKey.ConnectWallet}`
    );

    act(() => {
      fireEvent.click(connectButton);
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.tabs.menu.tab.items.connectwallet.tabheader)
      ).toBeVisible();
    })
  });

  test("Open Chat link", async () => {
    const { getByTestId, getByText } = render(
      <Provider store={storeMocked}>
        <Menu />
      </Provider>
    );

    expect(getByTestId("menu-tab")).toBeInTheDocument();
    expect(
      getByText(EN_TRANSLATIONS.tabs.menu.tab.items.chat.title)
    ).toBeInTheDocument();
    const chatButton = getByTestId(`menu-input-item-${SubMenuKey.Chat}`);

    act(() => {
      fireEvent.click(chatButton);
    });

    await waitFor(() => {
      expect(browserMock).toBeCalledWith({
        url: CHAT_LINK,
      });
    });
  });
});
