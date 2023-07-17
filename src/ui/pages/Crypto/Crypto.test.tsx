import {
  act,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Crypto } from "./Crypto";
import { store } from "../../../store";
import { TabsRoutePath } from "../../../routes/paths";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { cryptoAccountsMock } from "../../__mocks__/cryptoAccountsMock";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../../constants/appConstants";

describe("Crypto Tab", () => {
  test("Renders Crypto Tab", () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Crypto />
      </Provider>
    );

    expect(getByTestId("crypto-tab")).toBeInTheDocument();
    expect(getByTestId("menu-button")).toBeInTheDocument();
  });

  test("Renders placeholder when no crypto accounts are found", () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.CRYPTO],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {},
      cryptoAccountsCache: [],
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByTestId } = render(
      <Provider store={storeMocked}>
        <Crypto />
      </Provider>
    );

    expect(getByTestId("cards-placeholder")).toBeInTheDocument();
  });

  test("User has an option for reusing existing IDW seed phrase as a crypto account", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.CRYPTO],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {},
      cryptoAccountsCache: [],
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByText } = render(
      <Provider store={storeMocked}>
        <Crypto />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByText(EN_TRANSLATIONS.crypto.tab.create));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.crypto.addcryptoaccountmodal.reuse)
      ).toBeVisible();
    });
  });

  test.skip("User can reuse existing IDW seed phrase as a crypto account", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.CRYPTO],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {
        seedPhrase160:
          "example1 example2 example3 example4 example5 example6 example7 example8 example9 example10 example11 example12 example13 example14 example15",
        seedPhrase256: "",
        selected: FIFTEEN_WORDS_BIT_LENGTH,
      },
      cryptoAccountsCache: [],
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText, queryAllByTestId } = render(
      <Provider store={storeMocked}>
        <Crypto />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByText(EN_TRANSLATIONS.crypto.tab.create));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.crypto.addcryptoaccountmodal.reuse)
      ).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByTestId("add-crypto-account-reuse-button"));
    });

    await waitFor(() => {
      expect(queryAllByTestId("verify-password")[0]).toHaveAttribute(
        "is-open",
        "true"
      );
    });
  });

  test("User doesn't see an option for reusing existing IDW seed phrase as a crypto account if this is already in use", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.CRYPTO],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {},
      cryptoAccountsCache: {
        cryptoAccounts: cryptoAccountsMock,
        defaultCryptoAccount: cryptoAccountsMock[0].address,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByText, queryByText, getByTestId } = render(
      <Provider store={storeMocked}>
        <Crypto />
      </Provider>
    );

    act(() => {
      fireEvent.click(getByTestId("my-wallets-button"));
    });

    await waitFor(() => {
      expect(queryByText(EN_TRANSLATIONS.crypto.tab.create)).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByText(EN_TRANSLATIONS.crypto.tab.create));
    });

    await waitFor(() => {
      expect(
        queryByText(EN_TRANSLATIONS.crypto.addcryptoaccountmodal.reuse)
      ).toBeNull();
    });
  });

  test("User can open My Wallets menu and it's empty when no wallets have been creted", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.CRYPTO],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {},
      cryptoAccountsCache: [],
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByText, getByTestId, queryByText } = render(
      <Provider store={storeMocked}>
        <Crypto />
      </Provider>
    );

    expect(queryByText(EN_TRANSLATIONS.crypto.mywalletsmodal.empty)).toBeNull();

    act(() => {
      fireEvent.click(getByTestId("my-wallets-button"));
    });

    await waitFor(() => {
      expect(
        getByText(EN_TRANSLATIONS.crypto.mywalletsmodal.empty)
      ).toBeVisible();
    });
  });

  test("User can toggle accounts", async () => {
    const mockStore = configureStore();
    const dispatchMock = jest.fn();
    const initialState = {
      stateCache: {
        routes: [TabsRoutePath.CRYPTO],
        authentication: {
          loggedIn: true,
          time: Date.now(),
          passcodeIsSet: true,
        },
      },
      seedPhraseCache: {},
      cryptoAccountsCache: {
        cryptoAccounts: cryptoAccountsMock,
        defaultCryptoAccount: cryptoAccountsMock[0].address,
      },
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };

    const { queryByTestId, getByTestId, queryByText } = render(
      <Provider store={storeMocked}>
        <Crypto />
      </Provider>
    );

    expect(queryByText(cryptoAccountsMock[0].name)).toBeVisible();

    await waitFor(() => {
      expect(queryByTestId("crypto-tab-content")).toBeVisible();
    });

    await waitFor(() => {
      expect(getByTestId("my-wallets")).toHaveAttribute("is-open", "false");
    });

    act(() => {
      fireEvent.click(getByTestId("my-wallets-button"));
    });

    await waitFor(() => {
      expect(queryByTestId("my-wallets-account-1")).toBeVisible();
    });

    await waitFor(() => {
      expect(getByTestId("my-wallets")).toHaveAttribute("is-open", "true");
    });

    act(() => {
      fireEvent.click(getByTestId("my-wallets-account-1"));
    });

    expect(queryByText(cryptoAccountsMock[1].name)).toBeVisible();
  });
});
