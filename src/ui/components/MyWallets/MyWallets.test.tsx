import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MyWallets } from "./MyWallets";
import EN_TRANSLATIONS from "../../../locales/en/en.json";
import { cryptoAccountsFix } from "../../__fixtures__/cryptoAccountsFix";
import { TabsRoutePath } from "../navigation/TabsMenu";

describe("MyWallets modal", () => {
  const myWalletsIsOpen = true;
  const setMyWalletsIsOpen = jest.fn();
  const setAddAccountIsOpen = jest.fn();
  const defaultAccountData = cryptoAccountsFix[0];
  const setDefaultAccountData = jest.fn();
  const defaultAccountAddress = cryptoAccountsFix[0].address;
  const setDefaultAccountAddress = jest.fn();
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
    cryptoAccountsCache: cryptoAccountsFix,
  };

  const storeMocked = {
    ...mockStore(initialState),
    dispatch: dispatchMock,
  };

  test("Renders MyWallets modal", async () => {
    const { queryByText } = render(
      <Provider store={storeMocked}>
        <MyWallets
          myWalletsIsOpen={myWalletsIsOpen}
          setMyWalletsIsOpen={setMyWalletsIsOpen}
          setAddAccountIsOpen={setAddAccountIsOpen}
          defaultAccountData={defaultAccountData}
          setDefaultAccountData={setDefaultAccountData}
          defaultAccountAddress={defaultAccountAddress}
          setDefaultAccountAddress={setDefaultAccountAddress}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(
        queryByText(EN_TRANSLATIONS.crypto.mywalletsmodal.title)
      ).toBeVisible();
    });
  });

  test.skip("Renders all wallets", async () => {
    const { queryByText } = render(
      <Provider store={storeMocked}>
        <MyWallets
          myWalletsIsOpen={myWalletsIsOpen}
          setMyWalletsIsOpen={setMyWalletsIsOpen}
          setAddAccountIsOpen={setAddAccountIsOpen}
          defaultAccountData={defaultAccountData}
          setDefaultAccountData={setDefaultAccountData}
          defaultAccountAddress={defaultAccountAddress}
          setDefaultAccountAddress={setDefaultAccountAddress}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(queryByText(cryptoAccountsFix[0].name)).toBeVisible();
    });
  });

  test.skip("I can create a wallet", async () => {
    const { queryByText, getByText } = render(
      <Provider store={storeMocked}>
        <MyWallets
          myWalletsIsOpen={myWalletsIsOpen}
          setMyWalletsIsOpen={setMyWalletsIsOpen}
          setAddAccountIsOpen={setAddAccountIsOpen}
          defaultAccountData={defaultAccountData}
          setDefaultAccountData={setDefaultAccountData}
          defaultAccountAddress={defaultAccountAddress}
          setDefaultAccountAddress={setDefaultAccountAddress}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(queryByText(EN_TRANSLATIONS.crypto.tab.create)).toBeVisible();
    });

    act(() => {
      fireEvent.click(getByText(EN_TRANSLATIONS.crypto.tab.create));
    });

    await waitFor(() => {
      expect(setAddAccountIsOpen).toHaveBeenCalledWith(true);
    });
  });
});
