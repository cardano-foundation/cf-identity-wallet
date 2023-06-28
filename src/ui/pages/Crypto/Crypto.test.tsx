import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { Crypto } from "./Crypto";
import { store } from "../../../store";
import { TabsRoutePath } from "../../../routes/paths";
import EN_TRANSLATIONS from "../../../locales/en/en.json";

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
      seedPhraseCache: {},
      cryptoAccountsCache: [],
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByTestId, getByText } = render(
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
      expect(getByText(EN_TRANSLATIONS.verifypassword.title)).toBeVisible();
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
      cryptoAccountsCache: [
        {
          name: "Test wallet",
          blockchain: "Cardano",
          currency: "ADA",
          logo: "logo.png",
          nativeBalance: 273.85,
          usdBalance: 75.2,
          usesIdentitySeedPhrase: true,
        },
      ],
    };

    const storeMocked = {
      ...mockStore(initialState),
      dispatch: dispatchMock,
    };
    const { getByText, queryByText } = render(
      <Provider store={storeMocked}>
        <Crypto />
      </Provider>
    );

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
});
